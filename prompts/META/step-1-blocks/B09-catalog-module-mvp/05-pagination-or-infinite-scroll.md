# 05-pagination-or-infinite-scroll.md

## Title

Pagination — page param + Load More button (preserve filters)

## Objective

Implement server pagination with page/pageSize query params and a client-side “Load more” button that appends the next page while preserving filters.

## Steps

1. Extend list API to return hasMore (already done in S03).
2. Render first page on server; show LoadMore button if hasMore.
3. LoadMore constructs next URL with incremented page and same filters.

## Files to add/modify

- src/components/catalog/load-more.tsx
- src/app/(public)/catalog/page.tsx (wire pagination)

### src/components/catalog/load-more.tsx

```tsx
'use client';

import { useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function LoadMore({ hasMore }: { hasMore: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [loading, setLoading] = useState(false);

  if (!hasMore) return null;

  function onClick() {
    setLoading(true);
    const params = new URLSearchParams(sp.toString());
    const page = Number(params.get('page') || '1');
    params.set('page', String(page + 1));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="mt-6 flex justify-center">
      <button
        onClick={onClick}
        disabled={loading}
        className="gold-gradient text-fgOnGold min-h-11 px-6 py-3 rounded-md focus-gold shadow-cta disabled:opacity-60"
      >
        {loading ? 'Loading…' : 'Show more'}
      </button>
    </div>
  );
}
```

### src/app/(public)/catalog/page.tsx (patch with pagination)

```tsx
import { BusinessCard } from '@/components/cards/business-card';
import { LoadMore } from '@/components/catalog/load-more';
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
  const { rows, hasMore } = await listBusinessesWithFilters(qs);

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

      <LoadMore hasMore={hasMore} />
    </Section>
  );
}
```

Notes

- This triggers a full server re-render with page+1; simplest MVP path. For true infinite “append”, switch to client fetching or partial hydration later.

## Acceptance

- /catalog?page=2 shows the second page.
- “Show more” preserves filters and increments page without scroll jump.
- When no more data, button hides.
