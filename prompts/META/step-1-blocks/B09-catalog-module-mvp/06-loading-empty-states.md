# 06-loading-empty-states.md

## Title

Loading & Empty States — skeletons, empty message, route-level loading

## Objective

Provide user-friendly skeletons and empty states for Catalog list and Details page. Add route-level loading.tsx files.

## Steps

1) Add loading.tsx for /catalog and /catalog/[id].
2) Create skeleton grid and card skeleton.
3) Render an empty state when no results match filters.

## Files to add/modify

- src/app/(public)/catalog/loading.tsx
- src/app/(public)/catalog/[id]/loading.tsx
- src/components/catalog/skeletons.tsx
- src/app/(public)/catalog/page.tsx (render empty message when needed)

### src/components/catalog/skeletons.tsx

```tsx
export function CardSkeleton() {
  return (
    <div className="rounded-lg bg-card border border-border p-5 animate-pulse">
      <div className="h-12 w-12 rounded-md bg-bgElev" />
      <div className="mt-3 h-5 w-2/3 bg-bgElev rounded" />
      <div className="mt-2 h-4 w-1/3 bg-bgElev rounded" />
      <div className="mt-4 h-4 w-1/2 bg-bgElev rounded" />
      <div className="mt-4 h-9 w-28 bg-bgElev rounded" />
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### src/app/(public)/catalog/loading.tsx

```tsx
import { Section } from '@/components/ui/section';
import { GridSkeleton } from '@/components/catalog/skeletons';

export default function CatalogLoading() {
  return (
    <Section>
      <h1 className="h2">Partners Catalog</h1>
      <p className="mt-2 body-sm text-fgMuted">Loading…</p>
      <GridSkeleton count={6} />
    </Section>
  );
}
```

### src/app/(public)/catalog/[id]/loading.tsx

```tsx
import { Section } from '@/components/ui/section';
import { CardSkeleton } from '@/components/catalog/skeletons';

export default function PartnerDetailsLoading() {
  return (
    <Section>
      <h1 className="h2">Partner</h1>
      <div className="mt-6">
        <CardSkeleton />
      </div>
    </Section>
  );
}
```

### src/app/(public)/catalog/page.tsx (empty state patch)

```tsx
// ...imports unchanged

export default async function CatalogPage({ searchParams }: { searchParams: Record<string, string> }) {
  const qs = parseCatalogQuery(searchParams);
  const { rows, hasMore } = await listBusinessesWithFilters(qs);

  return (
    <Section>
      <h1 className="h2">Partners Catalog</h1>
      <p className="mt-2 body-sm text-fgMuted">
        Special conditions are available to club members after sign‑in.
      </p>

      <CatalogFilterBar searchParams={searchParams} />

      {rows.length === 0 ? (
        <div className="mt-10 rounded-lg border border-border bg-card p-6 text-sm text-fgMuted">
          No partners found. Try adjusting filters or <a href="/catalog" className="underline hover:text-gold-400">reset</a>.
        </div>
      ) : (
        <>
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
        </>
      )}
    </Section>
  );
}
```

## Acceptance

- Catalog and details routes show skeletons during loading.
- Empty state message appears when filters return no results.
- All components follow black & gold theme, accessible, mobile-first.

—

Напиши “B10” — пришлю следующий блок (Digital Club Card) в .md формате по шагам.
