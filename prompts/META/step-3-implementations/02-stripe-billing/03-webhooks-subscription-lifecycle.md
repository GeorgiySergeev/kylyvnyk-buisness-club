# step-3-implementations/02-stripe-billing/03-webhooks-subscription-lifecycle.md

## Title

Webhooks & Idempotency (Subscription Lifecycle)

## Objective

Безопасная обработка Stripe Webhooks с защитой от дублирования и синхронизацией `subscriptions` и `memberships`.

## Files

### src/app/api/stripe/webhook/route.ts

```ts
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { stripeEvents, subscriptions, memberships } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Idempotency check
  const [existingEvent] = await db.select().from(stripeEvents).where(eq(stripeEvents.id, event.id)).limit(1);
  if (existingEvent) {
    return new NextResponse('Event already processed', { status: 200 });
  }

  // Record event
  await db.insert(stripeEvents).values({
    id: event.id,
    type: event.type,
    status: 'processing',
  });

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      
      if (userId && session.subscription) {
        const subscriptionId = session.subscription as string;
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        await db.insert(subscriptions).values({
          userId,
          stripeSubscriptionId: stripeSubscription.id,
          stripeCustomerId: stripeSubscription.customer as string,
          stripePriceId: stripeSubscription.items.data[0].price.id,
          statusRaw: stripeSubscription.status,
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        });

        // Update membership
        await db.update(memberships)
          .set({ tier: 'VIP', status: 'ACTIVE', currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000) })
          .where(eq(memberships.userId, userId));
      }
    }
    
    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object as Stripe.Subscription;
      await db.update(subscriptions)
        .set({
          statusRaw: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        
      if (sub.status === 'active' || sub.status === 'trialing') {
         // Find user by customer id (via subscriptions) and update membership
         const [dbSub] = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, sub.id)).limit(1);
         if (dbSub) {
           await db.update(memberships)
             .set({ status: 'ACTIVE', currentPeriodEnd: new Date(sub.current_period_end * 1000) })
             .where(eq(memberships.userId, dbSub.userId));
         }
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      await db.update(subscriptions)
        .set({ statusRaw: sub.status, updatedAt: new Date() })
        .where(eq(subscriptions.stripeSubscriptionId, sub.id));
        
      const [dbSub] = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, sub.id)).limit(1);
      if (dbSub) {
        await db.update(memberships)
          .set({ tier: 'FREE', status: 'EXPIRED' }) // downgrades to free
          .where(eq(memberships.userId, dbSub.userId));
      }
    }

    // Mark event processed
    await db.update(stripeEvents).set({ status: 'processed' }).where(eq(stripeEvents.id, event.id));
    
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    await db.update(stripeEvents).set({ status: 'failed' }).where(eq(stripeEvents.id, event.id));
    console.error('[WEBHOOK_PROCESS_ERROR]', error);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
}
```

## Acceptance

- `stripeEvents` гарантирует 1-кратную обработку (идемпотентность).
- При `checkout.session.completed` создается запись подписки и выдается VIP статус.
- При удалении (`deleted`) пользователь понижается до `FREE`.