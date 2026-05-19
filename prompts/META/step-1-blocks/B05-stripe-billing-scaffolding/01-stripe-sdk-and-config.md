# 01-stripe-sdk-and-config.md

## Title

Stripe SDK and base config (server-only)

## Objective

Install Stripe, create a typed SDK client, and centralize env access. Provide helpers for site URL and product/price IDs.

## Steps

1) Install Stripe SDK.
2) Create server-only Stripe client with API version pinned.
3) Add helpers for site URL and VIP product/price IDs.
4) Document required env vars.

## Commands

```bash
pnpm add stripe
```

## Files to add/modify

- src/lib/stripe/config.ts
- src/lib/stripe/env.ts

### src/lib/stripe/env.ts

```ts
import 'server-only';

const get = (key: string, fallback?: string) => {
  const v = process.env[key] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing required env: ${key}`);
  }
  return v;
};

export const STRIPE_SECRET_KEY = get('STRIPE_SECRET_KEY');
export const STRIPE_WEBHOOK_SECRET = get('STRIPE_WEBHOOK_SECRET', ''); // can be empty locally
export const VIP_PRICE_ID = get('NEXT_PUBLIC_STRIPE_PRICE_VIP');
export const VIP_PRODUCT_ID = get('NEXT_PUBLIC_STRIPE_PRODUCT_VIP');

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
```

### src/lib/stripe/config.ts

```ts
import 'server-only';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from './env';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  // typescript: true // not needed; @types are bundled
});
```

## Acceptance

- stripe can be imported from '@/lib/stripe/config' on server.
- Missing env throws explicit error during server usage.
- VIP product and price IDs are available from env helper.
