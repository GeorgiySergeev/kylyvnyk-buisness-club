### Public route policy

- `cache: 'no-store'` (NOT `revalidate`). Members can be revoked instantly.
- Tag-based invalidation is overkill here; admin updates are infrequent and the
  card lookup is fast (PK on `cards.number`).
- Wrap reads in a fixed-shape DTO. Never return DB row spread.
- Add `robots: { index: false }` on the page-level metadata.
- Rate-limit by IP **and** by normalized card-number prefix.
- Turnstile token required on the form that POSTs the number; the GET URL
  remains scrape-able but every miss is rate-limited and adds to a bucket.
- Constant-time response shape: same JSON keys returned for "not found" and
  "found"; differ only in `status` (`NOT_FOUND` vs `ACTIVE|INACTIVE|EXPIRED`).
  Prevents existence oracle via response size / shape.

### Snippet

```ts
// app/(public)/verify-card/[number]/page.tsx
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { lookupCardPublic } from "@/lib/cards/lookup-public";
import { rateLimitVerifyCard } from "@/lib/rate-limit/verify-card";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const metadata = {
  robots: { index: false, follow: false },
  // No openGraph: do not let a member name surface in link previews.
};

export default async function Page({ params }: { params: { number: string } }) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  const ok = await rateLimitVerifyCard.check({ ip, number: params.number });
  if (!ok) return notFound(); // do NOT reveal rate-limit reason

  const dto = await lookupCardPublic(params.number);
  // dto is always the same shape — { number, memberName, memberType, status, expiresAt }.
  // status === "NOT_FOUND" when no row matched; client renders identically.
  return <VerifyCardView dto={dto} />;
}
```

```ts
// src/lib/cards/lookup-public.ts
import { eq } from 'drizzle-orm';
import 'server-only';

import { db } from '@/db/client';
import { cards } from '@/db/schema/card';
import { users } from '@/db/schema/user';

export type PublicCardDTO = {
  number: string;
  memberName: string | null;
  memberType: 'VIP' | 'BUSINESS' | null;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'NOT_FOUND';
  expiresAt: string | null; // ISO date
};

const NOT_FOUND: PublicCardDTO = {
  number: '',
  memberName: null,
  memberType: null,
  status: 'NOT_FOUND',
  expiresAt: null,
};

export async function lookupCardPublic(number: string): Promise<PublicCardDTO> {
  const row = await db
    .select({
      number: cards.number,
      memberName: users.displayName,
      memberType: cards.memberType,
      status: cards.status,
      expiresAt: cards.expiresAt,
    })
    .from(cards)
    .leftJoin(users, eq(users.id, cards.userId))
    .where(eq(cards.number, number))
    .limit(1);

  if (row.length === 0) return { ...NOT_FOUND, number };

  const c = row[0];
  return {
    number: c.number,
    memberName: c.memberName,
    memberType: c.memberType,
    status: c.status,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
  };
}
```

```ts
// src/lib/rate-limit/verify-card.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import 'server-only';

const redis = Redis.fromEnv();

// 10 lookups / IP / minute, 30 lookups / IP / hour.
const perIp = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  prefix: 'rl:vc:ip',
});

// 5 lookups / card-number / 10 minutes — kills enumeration.
const perNumber = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, '600 s'),
  prefix: 'rl:vc:num',
});

export const rateLimitVerifyCard = {
  async check({ ip, number }: { ip: string; number: string }) {
    const a = await perIp.limit(ip);
    const b = await perNumber.limit(number.toUpperCase());
    return a.success && b.success;
  },
};
```

### Card-number entropy requirement (also patch B10/01)

The numeric suffix must carry **≥ 48 bits of entropy** to make
enumeration infeasible at the rate limits above. Recommended format:

```
<VIP|BUS>-<COUNTRY_ISO2>-<BASE32_CROCKFORD_10_CHARS>
```

10 Crockford-Base32 chars ≈ 50 bits. Generate with `crypto.randomBytes(7)` and
encode; reject any sequential or low-entropy result.

### Acceptance

- Playwright: lookup an existing card → returns the 5 allowed keys, nothing more.
- Playwright: lookup a non-existent number → response has the same key set, only
  `status === "NOT_FOUND"`. Response body length differs by ≤ 8 bytes from a
  hit (constant-shape guarantee).
- Integration: hit the route 20× from one IP in 1 minute → 11th call onward is
  rejected (rate-limited).
- Integration: hit the route 6× for the same number from different IPs in 10
  minutes → 6th call is rejected.
- Admin marks a card `INACTIVE` → next public lookup (within < 5s) reports
  `INACTIVE`. **No 120-second stale window.**
- Page-level metadata contains `robots: { index: false }`; no Open Graph for
  this route.
