# 03-meta-og-structured-data.md

## Title

Meta/OG + JSON-LD (Organization, Website)

## Objective

Add JSON-LD for Organization and Website, align meta/OG with i18n, and expose a reusable SEO component.

## Steps

1) Create JsonLd components (Organization, Website).
2) Mount on the landing page.
3) Keep DEFAULT_SEO and metadataBase as-is; wire translated titles/descriptions where applicable.

## Files to add

- src/components/seo/jsonld.tsx
- src/app/(public)/page.tsx (mount JSON-LD)

### src/components/seo/jsonld.tsx

```tsx
'use client';

export function JsonLd({ data }: { data: Record<string, any> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd({
  name,
  url,
  logo,
}: {
  name: string;
  url: string;
  logo?: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
  };
  return <JsonLd data={data} />;
}

export function WebsiteJsonLd({
  name,
  url,
  potentialActionUrl,
}: {
  name: string;
  url: string;
  potentialActionUrl?: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    potentialAction: potentialActionUrl
      ? [
          {
            '@type': 'SearchAction',
            target: `${url}/catalog?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        ]
      : undefined,
  };
  return <JsonLd data={data} />;
}
```

### src/app/(public)/page.tsx (patch to mount JSON-LD)

```tsx
import dynamic from 'next/dynamic';
import { getSiteUrl, DEFAULT_SEO } from '@/lib/seo/site';
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo/jsonld';

const LandingHero = dynamic(() => import('@/features/landing/hero'), { ssr: true });
const LandingStats = dynamic(() => import('@/features/landing/stats'), { ssr: true });
const TopPartners = dynamic(() => import('@/features/landing/top-partners'), { ssr: true });
const RecommendedPartners = dynamic(() => import('@/features/landing/recommended-partners'), { ssr: true });

export default async function LandingPage() {
  const base = getSiteUrl();
  return (
    <>
      <OrganizationJsonLd name={DEFAULT_SEO.title} url={base} />
      <WebsiteJsonLd name={DEFAULT_SEO.title} url={base} potentialActionUrl={`${base}/catalog`} />

      <LandingHero />
      <LandingStats />
      <TopPartners />
      <RecommendedPartners />
    </>
  );
}
```

## Acceptance

- Page source contains valid Organization and WebSite JSON-LD.
- Titles/descriptions still come from metadata; translatable later if needed.
- No blocking scripts; components render client-side JSON-LD safely.
