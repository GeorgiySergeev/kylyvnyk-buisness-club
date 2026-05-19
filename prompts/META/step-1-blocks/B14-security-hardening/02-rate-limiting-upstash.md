# 02-rate-limiting-upstash.md

## Title

Rate Limiting — Upstash Redis for API routes and server actions

## Objective

Prevent abuse with IP-based rate limits on write endpoints: Submit Business, Introductions, Stripe portal/cancel, and public verification API.

## Steps

1) Install Upstash Redis + Ratelimit.
2) Create a reusable limiter by route key.
3) Apply in API routes and server actions.

## Commands

```bash
pnpm add @upstash/redis @upstash/ratelimit
```

## Files to add/modify

- src/lib/redis/client.ts
- src/lib/security/rate-limit.ts
- Patch targets:
  - src/features/business/server/actions.ts
  - src/features/introductions/server/actions.ts
  - src/app/api/stripe/portal/route.ts
  - src/app/api/stripe/cancel/route.ts
  - src/app/api/public/verify-card/[number]/route.ts

### src/lib/redis/client.ts

```ts
import 'server-only';
import { Redis } from '@upstash/redis';

export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    : null;
```

### src/lib/security/rate-limit.ts

```ts
import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/redis/client';
import { headers } from 'next/headers';

const limiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 m'), // default: 10 req / 10 min
      analytics: true,
      prefix: 'rl',
    })
  : null;

export async function rateLimitOrThrow(bucket: string, limit?: { tokens: number; window: string }) {
  if (!limiter) return; // disabled locally
  const ip = headers().get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const key = `${bucket}:${ip}`;
  const rl = await limiter.limit(key);
  if (!rl.success) {
    const retryAfter = Math.ceil((rl.reset - Date.now()) / 1000);
    const err = new Error('RATE_LIMITED');
    (err as any).status = 429;
    (err as any).retryAfter = retryAfter;
    throw err;
  }
}
```

### Apply in server actions and routes

- In each target, call before heavy work:

```ts
import { rateLimitOrThrow } from '@/lib/security/rate-limit';

// at the start (after auth/captcha as needed)
await rateLimitOrThrow('business:submit');
// or
await rateLimitOrThrow('intro:submit');
// or for API routes
await rateLimitOrThrow('stripe:portal');
await rateLimitOrThrow('stripe:cancel');
await rateLimitOrThrow('public:verify-card');
```

## Acceptance

- Rapid repeated submissions return 429 with friendly message.
- Limits can be tuned per bucket.
- Disabled gracefully if Redis envs are not set.
