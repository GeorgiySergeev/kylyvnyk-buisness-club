# 05-sitemap-with-i18n-skeleton.md

## Title

Sitemap with i18n scaffold — alternates per URL

## Objective

Update sitemap generation to include alternates.languages for future i18n. Single-locale MVP emits en only.

## Steps

1) Create a helper to produce static routes and alternates.
2) Patch app/sitemap.ts to add alternates.

## Files to modify/add

- src/i18n/sitemap.ts
- src/app/sitemap.ts (patch)

### src/i18n/sitemap.ts

```ts
import { getSiteUrl } from '@/lib/seo/site';

export function buildSitemapRoutes() {
  const base = getSiteUrl();

  const staticRoutes = [
    '',
    '/catalog',
    '/verify-card',
    '/legal/terms',
    '/legal/privacy',
    '/legal/cookie',
    '/legal/refund',
    '/legal/rules/club'
  ];

  const now = new Date();

  return staticRoutes.map((p) => {
    const url = `${base}${p}`;
    return {
      url,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: p === '' ? 1 : 0.6,
      alternates: {
        languages: {
          en: url
          // future: 'uk': `${base}/uk${p}`, 'de': `${base}/de${p}`, ...
        },
      },
    };
  });
}
```

### src/app/sitemap.ts (patch)

```ts
import type { MetadataRoute } from 'next';
import { buildSitemapRoutes } from '@/i18n/sitemap';

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapRoutes() as MetadataRoute.Sitemap;
}
```

## Acceptance

- /sitemap.xml renders entries with alternates.languages (en).
- Adding locales later only requires extending alternates map.
- Consistent with hreflang and metadata alternates.
