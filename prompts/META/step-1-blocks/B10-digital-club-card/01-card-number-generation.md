# 01-card-number-generation.md

## Title

Digital Card — number generation + ensure card for member

## Objective

Generate a unique, human‑readable card number and ensure every member has a card. Format: TYPE-CC-XXXXXX (e.g., VIP-INTL-000501). Country code is optional in MVP.

Notes

- TYPE: FREE | VIP (from membership)
- CC: 2–5 chars uppercase; MVP fallback "INTL"
- XXXXXX: zero‑padded 6‑digit pseudo‑random to reduce collisions
- Uniqueness: enforced by DB unique(cards.number); retry on conflict

## Steps

1. Add server utils to generate a card number with retries.
2. Add ensureMemberCard(userId, opts?) to create the card if absent.
3. Store memberName using profile or Clerk name fallback.

## Files to add/modify

- src/features/membership/server/card-number.ts
- src/features/membership/server/cards.ts

### src/features/membership/server/card-number.ts

```ts
import 'server-only';

function pad6(n: number) {
  return n.toString().padStart(6, '0');
}

// MVP: pseudo-random 6-digit suffix; can swap to sequence later.
function random6() {
  return Math.floor(Math.random() * 1_000_000);
}

export type MemberType = 'FREE' | 'VIP';

export function buildCardNumber({
  memberType,
  countryCode = 'INTL',
  suffix = pad6(random6()),
}: {
  memberType: MemberType;
  countryCode?: string; // e.g., 'UA', 'US', 'INTL'
  suffix?: string;
}) {
  const type = memberType.toUpperCase();
  const cc =
    (countryCode || 'INTL')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 5) || 'INTL';
  return `${type}-${cc}-${suffix}`;
}
```

### src/features/membership/server/cards.ts

```ts
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import 'server-only';

import { cards } from '@/db/schema/membership';
import { users } from '@/db/schema/user';
import { db } from '@/lib/db';

import { type MemberType, buildCardNumber } from './card-number';

async function getMemberNameFallback(userId: string) {
  // Attempt Clerk names; fallback to email local-part
  try {
    const cu = await currentUser();
    const email = cu?.emailAddresses?.[0]?.emailAddress ?? '';
    const local = email.split('@')[0] || 'Member';
    const name = [cu?.firstName, cu?.lastName].filter(Boolean).join(' ').trim();
    return name || local;
  } catch {
    // In server contexts without Clerk, fetch local user row (email)
    const row = await db.query.users.findFirst({ where: eq(users.id, userId) });
    const local = (row?.email || '').split('@')[0] || 'Member';
    return local;
  }
}

export async function ensureMemberCard(
  userId: string,
  opts?: { memberType?: MemberType; countryCode?: string; expiresAt?: Date | null },
) {
  const existing = await db.query.cards.findFirst({ where: eq(cards.userId, userId) });
  if (existing) return existing;

  const memberType: MemberType = opts?.memberType ?? 'FREE';
  const memberName = await getMemberNameFallback(userId);

  // Retry on unique violation up to N times
  for (let i = 0; i < 5; i++) {
    const number = buildCardNumber({ memberType, countryCode: opts?.countryCode });
    try {
      const [row] = await db
        .insert(cards)
        .values({
          userId,
          number,
          memberName,
          memberType: memberType as any,
          status: 'ACTIVE' as any,
          expiresAt: opts?.expiresAt ?? null,
        })
        .returning();
      if (row) return row;
    } catch (e: any) {
      // Unique violation → retry with new suffix
      if (String(e?.message || '').includes('unique') || String(e?.code) === '23505') continue;
      throw e;
    }
  }
  throw new Error('Failed to generate a unique card number after retries');
}
```

## Acceptance

- New members without a card receive one on first call to ensureMemberCard.
- Card number format TYPE-CC-XXXXXX; uniqueness enforced.
- Member name set from Clerk or email local‑part fallback.
