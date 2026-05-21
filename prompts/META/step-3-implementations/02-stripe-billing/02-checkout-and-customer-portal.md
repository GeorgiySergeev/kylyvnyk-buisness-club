# step-3-implementations/02-stripe-billing/02-checkout-and-customer-portal.md

## Title

Checkout & Customer Portal APIs

## Objective

Реализовать создание Checkout Session для покупки VIP и генерацию ссылки в Customer Portal для управления подпиской.

## Files

### src/app/api/stripe/checkout/route.ts

```ts
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { users } from '@/db/schema/users';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) return new NextResponse('User not found', { status: 404 });

    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP;
    if (!priceId) return new NextResponse('Stripe Price ID not configured', { status: 500 });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/upgrade?canceled=true`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
```

### src/app/api/stripe/portal/route.ts

```ts
import { auth } from '@clerk/nextjs/server';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { subscriptions } from '@/db/schema/users';
import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    // Ищем последнюю подписку пользователя
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);

    if (!sub || !sub.stripeCustomerId) {
      return new NextResponse('No active subscription found', { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('[STRIPE_PORTAL_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
```

## Acceptance

- Успешно создает Stripe Checkout Session с передачей `metadata.userId`.
- Customer Portal генерирует ссылку на основе сохраненного `stripeCustomerId`.
