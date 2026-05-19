# 04-recommended-partners-cards.md

## Title

Recommended Partners — 3 cards without open discounts

## Objective

Render up to 3 “Recommended” partners on landing (isRecommended=true, status=PUBLISHED). No open discounts — always show the private access note.

## Steps

1) Query recommended partners.
2) Reuse BusinessCard with revealCondition=false.
3) Add a “Show more” button linking to catalog.

## Files to add

- src/features/landing/server/recommended-partners.ts
- src/features/landing/recommended-partners.tsx

### src/features/landing/server/recommended-partners.ts

```ts
import 'server-only';
import { db } from '@/lib/db';
import { businesses, categories, countries, cities } from '@/db/schema/catalog';
import { eq, and } from 'drizzle-orm';

export type RecommendedPartner = {
  id: string;
  name: string;
  category: string;
  country: string;
  city: string;
};

export async function getRecommendedPartners(limit = 3): Promise<RecommendedPartner[]> {
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
    .where(and(eq(businesses.status, 'PUBLISHED' as any), eq(businesses.isRecommended, true)))
    .limit(limit);

  return rows;
}
```

### src/features/landing/recommended-partners.tsx

```tsx
import { getRecommendedPartners } from './server/recommended-partners';
import { BusinessCard } from '@/components/cards/business-card';
import { Section } from '@/components/ui/section';

export default async function RecommendedPartners() {
  const partners = await getRecommendedPartners(3);

  return (
    <Section className="border-t border-border">
      <h2 className="h2">Recommended</h2>
      <p className="mt-2 body-sm text-fgMuted">
        Special conditions are available after registration.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map((p) => (
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

      <div className="mt-6">
        <a
          href="/catalog"
          className="inline-block px-5 py-3 rounded-md border border-border hover:bg-bgElev focus-gold"
        >
          Show more
        </a>
      </div>
    </Section>
  );
}
```

## Acceptance

- Always hides discounts/conditions on recommended cards.
- “Show more” navigates to /catalog.
- Layout is responsive and accessible.
