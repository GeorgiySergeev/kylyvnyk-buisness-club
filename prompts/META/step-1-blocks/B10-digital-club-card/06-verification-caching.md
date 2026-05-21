# 06-verification-caching.md

## Title

Verification Caching — ISR + selective revalidation (optional Redis)

## Objective

Cache public verification responses to reduce DB load, while ensuring timely updates when membership changes.

## Steps

1. Use Next revalidate = 120 on page and API (done).
2. Add a helper to revalidate the specific verify page after membership changes (Stripe webhook).
3. Optional: add Upstash Redis layer for ultra‑fast cache (TTL 2–5 min).

## Files to add/modify

- src/features/membership/server/revalidate.ts
- src/lib/redis/client.ts (optional)
- src/lib/stripe/handlers.ts (patch example)

### src/features/membership/server/revalidate.ts

```ts
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import 'server-only';

import { cards } from '@/db/schema/membership';
import { db } from '@/lib/db';

export async function revalidateVerifyCardByUserId(userId: string) {
  const row = await db.query.cards.findFirst({ where: eq(cards.userId, userId) });
  if (!row) return;
  revalidatePath(`/verify-card/${encodeURIComponent(row.number)}`);
  // Also revalidate API variant if needed (Edge caches honor cache headers)
}
```

### src/lib/stripe/handlers.ts (append call post-upsert)

```ts
// after upsertSubscriptionFromStripe(...)
import { revalidateVerifyCardByUserId } from '@/features/membership/server/revalidate';

// At the end of upsertSubscriptionFromStripe(userId, s)
await revalidateVerifyCardByUserId(userId);
```

### Optional Redis (Upstash) for caching public card view

Commands

```bash
pnpm add @upstash/redis
```

File: src/lib/redis/client.ts

```ts
import { Redis } from '@upstash/redis';
import 'server-only';

export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    : null;
```

Snippet: use Redis in getPublicCardByNumber

```ts
import { redis } from '@/lib/redis/client';

export async function getPublicCardByNumberCached(number: string) {
  const key = `card:public:${number}`;
  if (redis) {
    const cached = await redis.get<CardPublicView>(key);
    if (cached) return cached;
  }
  const fresh = await getPublicCardByNumber(number);
  if (fresh && redis) {
    await redis.set(key, fresh, { ex: 300 }); // 5 minutes
  }
  return fresh;
}
```

## Acceptance

- Verify page/API revalidates within 2 minutes by default.
- On Stripe webhook updates, specific verify page is revalidated immediately.
- Optional Redis cache reduces DB hits and respects TTL.
