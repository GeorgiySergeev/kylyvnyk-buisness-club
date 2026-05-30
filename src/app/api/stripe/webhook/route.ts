import 'server-only';

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { db } from '@/db/client';
import { stripeEvents } from '@/db/schema';
import {
  handleCheckoutSessionCompleted,
  handleSubscriptionUpdated,
} from '@/features/billing/lib/membership-lifecycle';
import { env } from '@/lib/env';
import { log } from '@/lib/log';
import { stripe } from '@/lib/stripe/config';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    log.warn('stripe.webhook.signature_failed', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return NextResponse.json({ error: 'Invalid Stripe signature.' }, { status: 400 });
  }

  const [claimed] = await db
    .insert(stripeEvents)
    .values({
      eventId: event.id,
      type: event.type,
    })
    .onConflictDoNothing()
    .returning({ id: stripeEvents.id });

  if (!claimed) {
    return NextResponse.json({ duplicate: true }, { status: 200 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
          event.id,
          (subscriptionId) => stripe.subscriptions.retrieve(subscriptionId),
          env.STRIPE_PRICE_VIP_ANNUAL,
          env.STRIPE_PRICE_BUSINESS_ANNUAL,
        );
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          event.id,
          env.STRIPE_PRICE_VIP_ANNUAL,
          env.STRIPE_PRICE_BUSINESS_ANNUAL,
        );
        break;
      default:
        break;
    }

    await db
      .update(stripeEvents)
      .set({ processedAt: new Date(), succeeded: true })
      .where(eq(stripeEvents.eventId, event.id));
  } catch (error) {
    log.error('stripe.webhook.process_failed', {
      eventId: event.id,
      message: error instanceof Error ? error.message : 'unknown',
      type: event.type,
    });

    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
