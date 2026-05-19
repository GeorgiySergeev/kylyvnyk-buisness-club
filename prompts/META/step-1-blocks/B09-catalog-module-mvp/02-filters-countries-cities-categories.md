# 02-filters-countries-cities-categories.md

## Title

Catalog Filters — country, city, category (GET form with big gold actions)

## Objective

Add a server-side FilterBar with three selects (All Countries, All Cities, All Categories) and a prominent gold “Find partner” submit. Cities list narrows by selected country.

## Steps

1) Create server queries to list countries, categories, and cities by country.
2) Build FilterBar as a GET form that preserves query params.
3) Place FilterBar above the grid on /catalog.
4) Use large, touch-friendly controls and a gold submit button.

## Files to add/modify

- src/features/catalog/server/dicts.ts
- src/features/catalog/filters.tsx
- src/app/(public)/catalog/page.tsx (insert FilterBar, wire params)

### src/features/catalog/server/dicts.ts

```ts
import 'server-only';
import { db } from '@/lib/db';
import { countries, cities } from '@/db/schema/geo';
import { categories } from '@/db/schema/catalog';
import { eq } from 'drizzle-orm';

export async function getAllCountries() {
  return db.select().from(countries).orderBy(countries.name);
}

export async function getCategories() {
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCitiesByCountry(countryId?: number) {
  if (!countryId) return [];
  return db.select().from(cities).where(eq(cities.countryId, countryId)).orderBy(cities.name);
}
```

### src/features/catalog/filters.tsx

```tsx
import { getAllCountries, getCategories, getCitiesByCountry } from './server/dicts';
import { LinkButton } from '@/components/ui/link-button';

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function CatalogFilterBar({ searchParams }: Props) {
  const countryId = Number(searchParams.country ?? '') || undefined;
  const cityId = Number(searchParams.city ?? '') || undefined;
  const categoryId = Number(searchParams.category ?? '') || undefined;

  const [countries, categories, cities] = await Promise.all([
    getAllCountries(),
    getCategories(),
    getCitiesByCountry(countryId),
  ]);

  return (
    <form method="get" className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
      <select
        name="country"
        defaultValue={countryId ?? ''}
        className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold"
        aria-label="All countries"
      >
        <option value="">All Countries</option>
        {countries.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        name="city"
        defaultValue={cityId ?? ''}
        className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold"
        aria-label="All cities"
      >
        <option value="">All Cities</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        name="category"
        defaultValue={categoryId ?? ''}
        className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold"
        aria-label="All categories"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <div className="flex gap-3">
        <button
          type="submit"
          className="gold-gradient text-fgOnGold min-h-11 flex-1 rounded-md focus-gold shadow-cta"
        >
          Find partner
        </button>
        <LinkButton href="/catalog" className="min-h-11">
          Reset
        </LinkButton>
      </div>
    </form>
  );
}
```

### src/app/(public)/catalog/page.tsx (patch)

```tsx
import CatalogFilterBar from '@/features/catalog/filters';
import { Section } from '@/components/ui/section';
import { BusinessCard } from '@/components/cards/business-card';
import { listPublishedBusinesses } from '@/features/catalog/server/queries';

export const metadata = { title: 'Partners Catalog — KYLYVNYK CLUB' };

export default async function CatalogPage({ searchParams }: { searchParams: Record<string, string> }) {
  // For now, ignore params in data — wired in S03
  const items = await listPublishedBusinesses(12, 0);

  return (
    <>
      <Section>
        <h1 className="h2">Partners Catalog</h1>
        <p className="mt-2 body-sm text-fgMuted">
          Special conditions are available to club members after sign‑in.
        </p>

        <CatalogFilterBar searchParams={searchParams} />

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

- FilterBar renders selects with current values, cities depend on country.
- Large gold “Find partner” submit and “Reset” button present.
- Form method GET updates URL with query params.
