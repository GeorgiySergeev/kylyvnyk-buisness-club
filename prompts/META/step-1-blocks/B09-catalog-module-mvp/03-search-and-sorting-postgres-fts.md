# 03-search-and-sorting-postgres-fts.md

## Title

Search + Sorting — MVP ILIKE (FTS-ready), query schema, and server filtering

## Objective

Wire search (q) and sorting (recent|name). Use simple ILIKE on name/short_description for MVP, with a future FTS note. Validate query via Zod.

## Steps

1. Add Zod schema to parse query params safely.
2. Extend server query to apply filters: country, city, category, q, sort.
3. Apply pagination params (page, pageSize) later in S05.

## Files to add/modify

- src/features/catalog/params.ts
- src/features/catalog/server/queries.ts (extend to listBusinessesWithFilters)

### src/features/catalog/params.ts

```ts
import { z } from 'zod';

export const sortValues = ['recent', 'name'] as const;

export const catalogQuerySchema = z.object({
  country: z.coerce.number().int().positive().optional(),
  city: z.coerce.number().int().positive().optional(),
  category: z.coerce.number().int().positive().optional(),
  q: z.string().trim().min(1).max(120).optional(),
  sort: z.enum(sortValues).optional().default('recent'),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(60).optional().default(12),
});

export type CatalogQuery = z.infer<typeof catalogQuerySchema>;

export function parseCatalogQuery(
  input: Record<string, string | string[] | undefined>,
): CatalogQuery {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    flat[k] = Array.isArray(v) ? v[0] : (v ?? '');
  }
  const parsed = catalogQuerySchema.safeParse(flat);
  if (!parsed.success) {
    // Fallback to defaults
    return { sort: 'recent', page: 1, pageSize: 12 };
  }
  return parsed.data;
}
```

### src/features/catalog/server/queries.ts (extend)

```ts
import { and, asc, desc, eq, ilike, sql } from 'drizzle-orm';

import { businesses, categories } from '@/db/schema/catalog';
import { cities, countries } from '@/db/schema/geo';
import { db } from '@/lib/db';

import type { CatalogQuery } from '../params';

export async function listBusinessesWithFilters(qs: CatalogQuery) {
  const whereParts: any[] = [eq(businesses.status, 'PUBLISHED' as any)];

  if (qs.country) whereParts.push(eq(businesses.countryId, qs.country));
  if (qs.city) whereParts.push(eq(businesses.cityId, qs.city));
  if (qs.category) whereParts.push(eq(businesses.categoryId, qs.category));
  if (qs.q) {
    const pattern = `%${qs.q}%`;
    // MVP: ILIKE on name and short_description
    whereParts.push(
      sql`${ilike(businesses.name, pattern as any)} OR ${ilike(
        businesses.shortDescription,
        pattern as any,
      )}`,
    );
  }

  const orderBy =
    qs.sort === 'name'
      ? asc(businesses.name)
      : // 'recent': newest published first; fallback to createdAt
        desc(businesses.publishedAt ?? businesses.createdAt);

  const offset = (qs.page - 1) * qs.pageSize;

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
    .where(and(...whereParts))
    .orderBy(orderBy)
    .limit(qs.pageSize)
    .offset(offset);

  // Simple hasMore check by peeking the next item
  const nextRows = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(and(...whereParts))
    .orderBy(orderBy)
    .limit(1)
    .offset(offset + qs.pageSize);

  return { rows, hasMore: nextRows.length > 0 };
}

/*
Future FTS note:
- Enable extension: CREATE EXTENSION IF NOT EXISTS pg_trgm;
- Index example: CREATE INDEX idx_businesses_fts ON businesses USING GIN (name gin_trgm_ops, short_description gin_trgm_ops);
- Replace ILIKE with WHERE name ILIKE ... OR short_description ILIKE ... initially.
*/
```

### src/app/(public)/catalog/page.tsx (patch to use filters)

```tsx
import { BusinessCard } from '@/components/cards/business-card';
import { Section } from '@/components/ui/section';
import CatalogFilterBar from '@/features/catalog/filters';
import { parseCatalogQuery } from '@/features/catalog/params';
import { listBusinessesWithFilters } from '@/features/catalog/server/queries';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const qs = parseCatalogQuery(searchParams);
  const { rows } = await listBusinessesWithFilters(qs);

  return (
    <Section>
      <h1 className="h2">Partners Catalog</h1>
      <p className="mt-2 body-sm text-fgMuted">
        Special conditions are available to club members after sign‑in.
      </p>

      <CatalogFilterBar searchParams={searchParams} />

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rows.map((p) => (
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
  );
}
```

## Acceptance

- /catalog?q=spa&country=1&category=3&sort=name filters the list correctly.
- Query parsing resilient to bad inputs; defaults applied.
- Sorting toggles by recent/name.
