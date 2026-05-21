# 04-webhook-endpoint-and-idempotency.md

## Title

Stripe Webhook endpoint with idempotency and event logging

## Objective

Handle subscription lifecycle events and log all incoming Stripe events idempotently to DB.

## Steps

1. Create webhook route /api/webhooks/stripe.
2. Verify signature using raw request body.
3. Store event in stripe_events table for idempotency before processing.
4. Handle core events: checkout.session.completed, customer.subscription.created/updated/deleted.

## Files to add

- src/app/api/webhooks/stripe/route.ts
- src/lib/stripe/handlers.ts

### src/lib/stripe/handlers.ts

```ts
import { eq } from 'drizzle-orm';
import 'server-only';
import Stripe from 'stripe';

import { memberships } from '@/db/schema/membership';
import { stripeEvents, subscriptions } from '@/db/schema/stripe';
import { db } from '@/lib/db';

function toDateOrNull(ts?: number | null): Date | null {
  return ts ? new Date(ts * 1000) : null;
}

export async function isEventProcessed(eventId: string) {
  const existing = await db.query.stripeEvents.findFirst({
    where: eq(stripeEvents.eventId, eventId),
  });
  return existing?.succeeded ?? false;
}

export async function markEventStart(e: Stripe.Event) {
  try {
    await db.insert(stripeEvents).values({
      eventId: e.id,
      type: e.type,
      object: (e.data?.object as any)?.object ?? e.object,
      payload: e as any,
      succeeded: false,
    });
  } catch {
    // unique violation means already recorded; proceed
  }
}

export async function markEventDone(eventId: string, error?: string) {
  await db
    .update(stripeEvents)
    .set({ succeeded: !error, error: error ?? null, processedAt: new Date() })
    .where(eq(stripeEvents.eventId, eventId));
}

export async function upsertSubscriptionFromStripe(userId: string, s: Stripe.Subscription) {
  const statusRaw = s.status;
  const currentPeriodEnd = toDateOrNull(s.current_period_end);
  const cancelAtPeriodEnd = Boolean(s.cancel_at_period_end);

  // Upsert subscription row by stripe_subscription_id
  const existing = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.stripeSubscriptionId, s.id),
  });

  if (existing) {
    await db
      .update(subscriptions)
      .set({
        userId,
        stripeCustomerId: typeof s.customer === 'string' ? s.customer : s.customer.id,
        statusRaw,
        currentPeriodEnd,
        cancelAtPeriodEnd,
        updatedAt: new Date(),
        canceledAt: s.canceled_at ? toDateOrNull(s.canceled_at) : null,
      })
      .where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values({
      userId,
      stripeCustomerId: typeof s.customer === 'string' ? s.customer : s.customer.id,
      stripeSubscriptionId: s.id,
      statusRaw,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      createdAt: new Date(),
      updatedAt: new Date(),
      canceledAt: s.canceled_at ? toDateOrNull(s.canceled_at) : null,
    });
  }

  // Reflect membership table
  // ACTIVE until current_period_end even if cancel_at_period_end = true
  await db
    .insert(memberships)
    .values({
      userId,
      type: 'VIP' as any,
      status: cancelAtPeriodEnd ? ('CANCELED' as any) : ('ACTIVE' as any),
      validTo: currentPeriodEnd ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [memberships.userId, memberships.type, memberships.status], // matches unique in schema
      set: {
        validTo: currentPeriodEnd ?? null,
        updatedAt: new Date(),
      },
    });
}

export function getUserIdFromMeta(obj: any): string | null {
  const md = obj?.metadata as Record<string, string> | undefined;
  return md?.app_user_id ?? null;
}
```

### src/app/api/webhooks/stripe/route.ts

```ts
import { NextResponse } from 'next/server';

import { stripe } from '@/lib/stripe/config';
import { STRIPE_WEBHOOK_SECRET } from '@/lib/stripe/env';
import {
  getUserIdFromMeta,
  isEventProcessed,
  markEventDone,
  markEventStart,
  upsertSubscriptionFromStripe,
} from '@/lib/stripe/handlers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature');
  if (!sig || !STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'NO_SIGNATURE' }, { status: 400 });
  }

  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Idempotency guard
  if (await isEventProcessed(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }
  await markEventStart(event);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any; // Stripe.Checkout.Session
        // The subscription ID may be present in session.subscription
        // Metadata at session or at subscription_data holds app_user_id
        const userId =
          getUserIdFromMeta(session) ??
          (typeof session.subscription === 'string'
            ? null
            : getUserIdFromMeta(session.subscription));
        if (userId && typeof session.subscription === 'string') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await upsertSubscriptionFromStripe(userId, subscription);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any; // Stripe.Subscription
        const userId = getUserIdFromMeta(sub);
        if (userId) {
          await upsertSubscriptionFromStripe(userId, sub);
        }
        break;
      }
      default:
        // No-op for other events in MVP
        break;
    }
    await markEventDone(event.id);
    return NextResponse.json({ received: true });
  } catch (e: any) {
    await markEventDone(event.id, e?.message ?? 'unknown error');
    return NextResponse.json({ error: 'PROCESSING_FAILED' }, { status: 500 });
  }
}
```

## Acceptance

- Webhook verifies signature and persists all events.
- Duplicate delivery returns duplicate: true without double processing.
- Subscription lifecycle updates subscriptions + memberships as designed.
