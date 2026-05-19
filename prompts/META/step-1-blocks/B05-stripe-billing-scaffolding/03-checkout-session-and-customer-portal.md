# 03-checkout-session-and-customer-portal.md

## Title

Checkout Session (subscription) and Customer Portal endpoints

## Objective

Create API routes to:

- Start a Stripe Checkout Session for VIP subscription.
- Open Stripe Billing Customer Portal for existing subscribers.

## Steps

1) Create a server util to ensure we can attribute sessions to app users (pass metadata).
2) Implement POST /api/stripe/checkout to create subscription checkout.
3) Implement POST /api/stripe/portal to open billing portal (requires a Stripe customer).

## Files to add

- src/lib/stripe/customers.ts
- src/app/api/stripe/checkout/route.ts
- src/app/api/stripe/portal/route.ts

### src/lib/stripe/customers.ts

```ts
import 'server-only';
import { stripe } from './config';
import { db } from '@/lib/db';
import { subscriptions } from '@/db/schema/stripe';
import { eq } from 'drizzle-orm';

export async function findCustomerIdByUserId(userId: string): Promise<string | null> {
  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.userId, userId),
  });
  return sub?.stripeCustomerId ?? null;
}

export async function searchStripeCustomerByEmail(email: string): Promise<string | null> {
  // Requires Stripe Search to be enabled on your account
  const res = await stripe.customers.search({ query: `email:'${email}'` });
  const customer = res.data?.[0];
  return customer?.id ?? null;
}
```

### src/app/api/stripe/checkout/route.ts

```ts
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe/config';
import { SITE_URL, VIP_PRICE_ID } from '@/lib/stripe/env';
import { ensureUserSynced } from '@/features/auth/server/user-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const cu = await currentUser();
  const email = cu?.emailAddresses?.[0]?.emailAddress ?? undefined;

  const user = await ensureUserSynced();
  if (!user) return NextResponse.json({ error: 'NO_USER' }, { status: 400 });

  const success = `${SITE_URL}/member/subscription?status=success&session_id={CHECKOUT_SESSION_ID}`;
  const cancel = `${SITE_URL}/member/subscription?status=cancelled`;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    billing_address_collection: 'auto',
    allow_promotion_codes: false,
    line_items: [{ price: VIP_PRICE_ID, quantity: 1 }],
    success_url: success,
    cancel_url: cancel,
    customer_email: email,
    metadata: { app_user_id: user.id },
    subscription_data: {
      metadata: { app_user_id: user.id },
    },
  });

  return NextResponse.json({ id: session.id, url: session.url });
}
```

### src/app/api/stripe/portal/route.ts

```ts
import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe } from '@/lib/stripe/config';
import { SITE_URL } from '@/lib/stripe/env';
import { ensureUserSynced } from '@/features/auth/server/user-sync';
import { findCustomerIdByUserId, searchStripeCustomerByEmail } from '@/lib/stripe/customers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const cu = await currentUser();
  const email = cu?.emailAddresses?.[0]?.emailAddress;

  const user = await ensureUserSynced();
  if (!user) return NextResponse.json({ error: 'NO_USER' }, { status: 400 });

  let customerId = await findCustomerIdByUserId(user.id);
  if (!customerId && email) {
    customerId = await searchStripeCustomerByEmail(email);
  }

  if (!customerId) {
    return NextResponse.json({ error: 'NO_CUSTOMER' }, { status: 404 });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${SITE_URL}/member/subscription`,
  });

  return NextResponse.json({ url: portal.url });
}
```

## Acceptance

- POST /api/stripe/checkout returns a session URL; opening it starts a subscription checkout.
- POST /api/stripe/portal returns a portal URL if the user has a Stripe customer.
- Session metadata contains app_user_id for webhook attribution.
