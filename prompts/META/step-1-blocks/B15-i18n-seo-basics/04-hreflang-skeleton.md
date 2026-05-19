# 04-hreflang-skeleton.md

## Title

hreflang scaffold — alternates metadata, single-locale MVP

## Objective

Expose alternates.languages metadata for hreflang. Single locale now, easy to extend later.

## Steps

1) Add a small helper to compute alternates per route.
2) Use generateMetadata on landing to include alternates.
3) Keep locales array in i18n config for future growth.

## Files to add

- src/i18n/alternates.ts
- src/app/(public)/page.tsx (export generateMetadata)

### src/i18n/alternates.ts

```ts
import { i18n } from './config';
import { getSiteUrl } from '@/lib/seo/site';

export function buildAlternates(pathname = '') {
  const base = getSiteUrl();
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  // MVP single-locale
  const languages: Record<string, string> = {
    'en': `${base}${clean}`,
  };
  return { languages };
}
```

### src/app/(public)/page.tsx (add generateMetadata)

```tsx
import type { Metadata } from 'next';
import { buildAlternates } from '@/i18n/alternates';
import { getSiteUrl, DEFAULT_SEO } from '@/lib/seo/site';
// ...existing imports

export async function generateMetadata(): Promise<Metadata> {
  const url = getSiteUrl();
  return {
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    alternates: buildAlternates(''),
    openGraph: {
      title: DEFAULT_SEO.title,
      description: DEFAULT_SEO.description,
      url,
      type: 'website',
      images: [{ url: DEFAULT_SEO.ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: DEFAULT_SEO.title,
      description: DEFAULT_SEO.description,
      images: [DEFAULT_SEO.ogImage],
    },
  };
}
```

## Acceptance

- Page head includes link rel="alternate" hreflang entries (en only for now).
- Helper makes it trivial to add more locales later.
