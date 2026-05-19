# 05-show-more-and-navigation.md

## Title

Landing assembly — compose Hero, Stats, Top Partners, Recommended, and navigation to Catalog/Sign‑up

## Objective

Assemble landing page from B08 components. Ensure mobile spacing, headings hierarchy, and navigation work.

## Steps

1) Replace placeholder app/(public)/page.tsx with composed sections.
2) Verify top nav links and “View all”/“Show more” go to /catalog.
3) Validate keyboard navigation and focus.

## Files to modify

- src/app/(public)/page.tsx

### src/app/(public)/page.tsx

```tsx
import dynamic from 'next/dynamic';

const LandingHero = dynamic(() => import('@/features/landing/hero'), { ssr: true });
const LandingStats = dynamic(() => import('@/features/landing/stats'), { ssr: true });
const TopPartners = dynamic(() => import('@/features/landing/top-partners'), { ssr: true });
const RecommendedPartners = dynamic(() => import('@/features/landing/recommended-partners'), { ssr: true });

export default async function LandingPage() {
  return (
    <>
      {/* HERO */}
      <LandingHero />

      {/* STATS */}
      <LandingStats />

      {/* TOP PARTNERS */}
      <TopPartners />

      {/* RECOMMENDED */}
      <RecommendedPartners />
    </>
  );
}
```

## Acceptance

- Landing shows all four sections in correct order.
- Links navigate to /catalog and auth pages as intended.
- No layout shift; sections are keyboard navigable.
