# 02-stats-circles-block.md

## Title

Stats block — 3 circular metrics (Members, Countries, Partners)

## Objective

Add a visually distinct stats block with 3 round counters. Numbers should be real (DB) or approximate; avoid misleading claims.

## Steps

1) Create server query to count active users, countries, and published partners.
2) Build a circular stat component with accessible labels.
3) Place block below hero.

## Files to add

- src/features/landing/server/stats.ts
- src/features/landing/stats.tsx

### src/features/landing/server/stats.ts

```ts
import 'server-only';
import { db } from '@/lib/db';
import { users } from '@/db/schema/user';
import { countries } from '@/db/schema/geo';
import { businesses } from '@/db/schema/catalog';
import { eq } from 'drizzle-orm';

export async function getLandingStats() {
  const [usersCountRow] = await db.execute<{ count: string }>(`select count(*)::text as count from users where status = 'ACTIVE'`);
  const [countriesCountRow] = await db.execute<{ count: string }>(`select count(*)::text as count from countries`);
  const [partnersCountRow] = await db.execute<{ count: string }>(`select count(*)::text as count from businesses where status = 'PUBLISHED'`);

  const members = Number(usersCountRow?.count || 0);
  const countriesNum = Number(countriesCountRow?.count || 0);
  const partners = Number(partnersCountRow?.count || 0);

  return {
    members,
    countries: countriesNum,
    partners,
  };
}
```

### src/features/landing/stats.tsx

```tsx
import { getLandingStats } from './server/stats';

function Circle({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-full border border-border bg-card shadow-soft size-28 md:size-32">
      <div className="text-2xl md:text-3xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs md:text-sm text-fgMuted">{label}</div>
    </div>
  );
}

function formatPlus(n: number) {
  if (n >= 10000) return `${Math.floor(n / 1000)}k+`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k+`;
  if (n > 0) return `${n}+`;
  return '—';
}

export default async function LandingStats() {
  const { members, countries, partners } = await getLandingStats();

  return (
    <section className="border-b border-border">
      <div className="container py-10 md:py-14">
        <div className="grid grid-cols-3 gap-3 place-items-center">
          <Circle value={formatPlus(members)} label="Members" />
          <Circle value={formatPlus(countries)} label="Countries" />
          <Circle value={formatPlus(partners)} label="Partners" />
        </div>
        <p className="sr-only">
          Currently approximately {members} members across {countries} countries and {partners} partners.
        </p>
      </div>
    </section>
  );
}
```

## Acceptance

- 3 round counters render and scale on mobile.
- Values come from DB; if 0, show “—”.
- No unverifiable marketing claims.
