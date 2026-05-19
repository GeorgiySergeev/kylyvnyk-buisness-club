# 01-partners-list-published-only.md

## Title

Catalog — list PUBLISHED partners (grid + reusable card)

## Objective

Create public Catalog route that lists only PUBLISHED businesses in a responsive grid using a reusable BusinessCard. Prepare for filters/search/pagination.

## Steps

1) Add app route for /catalog under (public) group.
2) Create server query to fetch PUBLISHED partners with minimal fields (name, category, country, city).
3) Render a responsive grid with BusinessCard. No open discounts in list.
4) Add heading + small helper text about private conditions.

## Files to add/modify

- src/app/(public)/catalog/page.tsx
- src/features/catalog/server/queries.ts (append list function if missing)
- Reuse: src/components/cards/business-card.tsx (from B08)

### src/features/catalog/server/queries.ts

```ts
import 'server-only';
import { db } from '@/lib/db';
import { businesses, categories } from '@/db/schema/catalog';
import { countries, cities } from '@/db/schema/geo';
import { and, eq } from 'drizzle-orm';

export type CatalogItem = {
  id: string;
  name: string;
  category: string | null;
  country: string | null;
  city: string | null;
};

export async function listPublishedBusinesses(limit = 12, offset = 0): Promise<CatalogItem[]> {
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
    .where(and(eq(businesses.status, 'PUBLISHED' as any)))
    .limit(limit)
    .offset(offset);

  return rows;
}
```

### src/app/(public)/catalog/page.tsx

```tsx
import { Section } from '@/components/ui/section';
import { BusinessCard } from '@/components/cards/business-card';
import { listPublishedBusinesses } from '@/features/catalog/server/queries';

export const metadata = { title: 'Partners Catalog — KYLYVNYK CLUB' };

export default async function CatalogPage() {
  const items = await listPublishedBusinesses(12, 0);

  return (
    <>
      <Section>
        <h1 className="h2">Partners Catalog</h1>
        <p className="mt-2 body-sm text-fgMuted">
          Special conditions are available to club members after sign‑in.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <BusinessCard
              key={p.id}
              id={p.id}
              name={p.name}
              category={p.category ?? '—'}
              country={p.country ?? '—'}
              city={p.city ?? '—'}
              specialCondition={null}
              revealCondition={false}
            />
          ))}
        </div>
      </Section>
    </>
  );
}
```

## Acceptance

- /catalog renders a grid with only PUBLISHED partners.
- No discounts revealed. Each card links to details page.
- Mobile-first layout with accessible focus states.
