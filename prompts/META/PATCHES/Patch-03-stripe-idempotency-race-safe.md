### Snippet — race-safe idempotent handler

```ts
// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import 'server-only';

import { db } from '@/db/client';
import { stripeEvents } from '@/db/schema/stripe-events';
import { stripe } from '@/lib/stripe/config';
import { handleStripeEvent } from '@/lib/stripe/dispatch';

export const runtime = 'nodejs'; // Stripe needs raw body — not edge

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  if (!sig) return new NextResponse('missing signature', { status: 400 });

  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e) {
    return new NextResponse('invalid signature', { status: 400 });
  }

  // Atomic claim: if another worker already inserted this event_id,
  // the ON CONFLICT branch returns 0 rows → we exit early.
  const claimed = await db
    .insert(stripeEvents)
    .values({
      eventId: event.id,
      type: event.type,
      payload: event as unknown as object,
      succeeded: false,
    })
    .onConflictDoNothing({ target: stripeEvents.eventId })
    .returning({ id: stripeEvents.id });

  if (claimed.length === 0) {
    // Already processed (or being processed). Respond 200 so Stripe
    // does not retry — duplicates are expected and not an error.
    return NextResponse.json({ duplicate: true });
  }

  try {
    await handleStripeEvent(event);
    await db
      .update(stripeEvents)
      .set({ succeeded: true, processedAt: new Date() })
      .where(eq(stripeEvents.id, claimed[0].id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    await db
      .update(stripeEvents)
      .set({ error: String(err) })
      .where(eq(stripeEvents.id, claimed[0].id));
    // 500 → Stripe will retry. Our claim row stays with succeeded=false
    // until the next retry succeeds.
    return new NextResponse('handler failed', { status: 500 });
  }
}
```

### Required schema bit (already in step-2)

```ts
// src/db/schema/stripe-events.ts (excerpt)
export const stripeEvents = pgTable(
  'stripe_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: text('event_id').notNull(),
    type: text('type').notNull(),
    payload: jsonb('payload').notNull(),
    succeeded: boolean('succeeded').notNull().default(false),
    error: text('error'),
    receivedAt: timestamp('received_at', { withTimezone: true }).defaultNow().notNull(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
  },
  (t) => ({
    eventIdUx: uniqueIndex('stripe_events_event_id_ux').on(t.eventId),
  }),
);
```

### Acceptance

- Playwright/integration: hit the webhook twice with the same `event.id`;
  assert handler side-effect runs exactly once.
- Unit: simulate handler throw; assert `succeeded=false`, `error` set, 500 returned.
- Unit: simulate duplicate; assert `200 { duplicate: true }` and no handler call.
