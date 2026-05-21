# 03-top-partners-cards.md

## Title

Top Partners — 3 cards with logo/name/category/location and optional special condition (for signed users)

## Objective

Display up to 3 “Top Partners” on the landing, picked by isTopPartner=true and status=PUBLISHED. For guests, do not reveal special conditions; for signed‑in users, show shortText if available.

Note: If logos are not yet stored in DB, render monogram avatar.

## Steps

1. Create server query for top partners.
2. Build BusinessCard component with graceful fallback logo.
3. Render a 3-card grid; CTA “More details” navigates to partner page.

## Files to add

- src/features/landing/server/top-partners.ts
- src/components/cards/business-card.tsx
- src/features/landing/top-partners.tsx

### src/features/landing/server/top-partners.ts

```ts
import { and, desc, eq } from 'drizzle-orm';
import 'server-only';

import { businesses, categories, cities, countries } from '@/db/schema/catalog';
import { db } from '@/lib/db';

export type TopPartner = {
  id: string;
  name: string;
  category: string;
  country: string;
  city: string;
  // optional future: logoUrl?: string;
};

export async function getTopPartners(limit = 3): Promise<TopPartner[]> {
  const rows = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      category: categories.name,
      country: countries.name,
      city: cities.name,
    })
    .from(businesses)
    .leftJoin(categories, eq(categories.id, businesses.categoryId))
    .leftJoin(countries, eq(countries.id, businesses.countryId))
    .leftJoin(cities, eq(cities.id, businesses.cityId))
    .where(and(eq(businesses.status, 'PUBLISHED' as any), eq(businesses.isTopPartner, true)))
    .limit(limit);

  return rows;
}
```

### src/components/cards/business-card.tsx

```tsx
import Link from 'next/link';

import { CardPremium } from '@/components/ui/card-premium';

function Monogram({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="flex size-12 items-center justify-center rounded-md border border-border bg-bgElev text-gold font-bold">
      {initials}
    </div>
  );
}

export function BusinessCard({
  id,
  name,
  category,
  country,
  city,
  specialCondition,
  revealCondition = false,
}: {
  id: string;
  name: string;
  category: string;
  country: string;
  city: string;
  specialCondition?: string | null;
  revealCondition?: boolean;
}) {
  return (
    <CardPremium className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Monogram name={name} />
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-fgMuted">{category}</div>
        </div>
      </div>

      <div className="text-sm text-fgMuted">
        {country}, {city}
      </div>

      <div className="text-sm">
        {revealCondition && specialCondition ? (
          <span className="text-gold-400">{specialCondition}</span>
        ) : (
          <span className="text-fgMuted">Special conditions are available after sign‑in.</span>
        )}
      </div>

      <div className="mt-2">
        <Link
          href={`/catalog/${id}`}
          className="inline-block px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold text-sm"
          aria-label={`View details for ${name}`}
        >
          More details
        </Link>
      </div>
    </CardPremium>
  );
}
```

### src/features/landing/top-partners.tsx

```tsx
import { auth } from '@clerk/nextjs/server';

import { BusinessCard } from '@/components/cards/business-card';
import { Section } from '@/components/ui/section';

import { getTopPartners } from './server/top-partners';

export default async function TopPartners() {
  const { userId } = auth();
  const partners = await getTopPartners(3);

  return (
    <Section>
      <div className="flex items-end justify-between">
        <h2 className="h2">Top Partners</h2>
        <a href="/catalog" className="text-sm hover:text-gold-400">
          View all
        </a>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map((p) => (
          <BusinessCard
            key={p.id}
            id={p.id}
            name={p.name}
            category={p.category ?? '—'}
            country={p.country ?? '—'}
            city={p.city ?? '—'}
            specialCondition={null} // TODO: attach shortText when offers are stored
            revealCondition={Boolean(userId)} // show details only when signed-in
          />
        ))}
      </div>
    </Section>
  );
}
```

## Acceptance

- Exactly up to 3 top partner cards show.
- Guests see “Special conditions are available after sign‑in.”
- Signed users see condition text when available (placeholder now).
