# 02-vercel-env-setup.md

## Title

Vercel & Environment Setup (.env.example, basic runtime env)

## Objective

Prepare environment variables, minimal runtime env helper, and Vercel config stubs.

## Steps

1) Add .env.example with all required keys
2) Ensure next.config.js exists
3) Add vercel.json with base headers
4) Create src/env.ts for minimal runtime access

## Files to add/modify

- .env.example
- next.config.js
- vercel.json
- src/env.ts

### .env.example

```env
# App
NEXT_PUBLIC_APP_NAME=KYLYVNYK CLUB
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Database
DATABASE_URL=postgres://user:pass@host:5432/kylyvnyk

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_VIP=
NEXT_PUBLIC_STRIPE_PRODUCT_VIP=

# CAPTCHA
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=

# Redis (rate limit)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### next.config.js

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  images: { remotePatterns: [] }
};
module.exports = nextConfig;
```

### vercel.json

```json
{
  "version": 2,
  "routes": [],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

### src/env.ts

```ts
export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  NEXT_PUBLIC_STRIPE_PRICE_VIP: process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP ?? '',
  NEXT_PUBLIC_STRIPE_PRODUCT_VIP: process.env.NEXT_PUBLIC_STRIPE_PRODUCT_VIP ?? '',
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY ?? '',
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ?? '',
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ?? ''
};
```

## Acceptance

- .env.example committed
- Build works with empty defaults locally (no secret leakage)
- Vercel can import envs via dashboard
