# 05-subscription-status-sync.md

## Title

Sync subscription status to Membership model

## Objective

Ensure VIP Membership reflects Stripe status:

- ACTIVE while subscription is active or cancel_at_period_end=true (until period end).
- CANCELED when cancellation requested; valid_to tracks current_period_end.

## Steps

1) In webhook handler, map Stripe Subscription to DB (already done in 04).
2) Provide a reusable service to read “effective VIP access” for a user.
3) Add a nightly script outline (optional) to finalize expirations after valid_to.

## Files to add

- src/features/membership/server/access.ts
- scripts/membership-expirations.md (ops note)

### src/features/membership/server/access.ts

```ts
import 'server-only';
import { db } from '@/lib/db';
import { memberships } from '@/db/schema/membership';
import { and, eq, gte, isNull, or } from 'drizzle-orm';

export async function hasVipAccess(userId: string) {
  const now = new Date();
  const m = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, userId),
      eq(memberships.type, 'VIP' as any),
      or(isNull(memberships.validTo), gte(memberships.validTo, now))
    ),
  });
  // VIP access is granted if record exists (ACTIVE or CANCELED) and valid_to not passed yet.
  return Boolean(m);
}
```

### scripts/membership-expirations.md

```md
# Membership Expirations (Ops)

- Optional cron (daily) can:
  - Remove expired VIP access (valid_to < now).
  - Ensure FREE baseline membership exists if needed.
- For MVP we rely on `valid_to` checks at runtime, no cron required.
```

## Acceptance

- hasVipAccess(userId) returns true while current_period_end not passed.
- Membership table updated by webhook ensures accurate UI gating.
