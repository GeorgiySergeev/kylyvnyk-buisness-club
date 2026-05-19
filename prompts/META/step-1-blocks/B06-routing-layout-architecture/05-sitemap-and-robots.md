# 05-sitemap-and-robots.md

## Title

Sitemap and Robots Stubs (App Router)

## Objective

Expose standard sitemap.xml and robots.txt using Next’s built-in route handlers. Include key URLs for MVP and leave hooks for dynamic entries later.

## Steps

1) Create app/sitemap.ts generating a minimal list of routes.
2) Create app/robots.ts with basic allow and sitemap link.
3) Ensure metadataBase is set for absolute URLs (done in B06 S02).

## Files to add

- src/app/sitemap.ts
- src/app/robots.ts

### src/app/sitemap.ts

```ts
import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  const staticRoutes = [
    '',
    '/catalog',
    '/verify-card',
    '/legal/terms',
    '/legal/privacy',
    '/legal/cookie',
    '/legal/refund',
    '/legal/rules/club',
  ];

  const now = new Date();

  return staticRoutes.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.6,
  }));
}
```

### src/app/robots.ts

```ts
import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo/site';

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin',
          '/member',
          '/business',
          '/api/',
          '/tokens', // dev page
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
```

## Acceptance

- /sitemap.xml lists static MVP routes with absolute URLs.
- /robots.txt allows public pages and disallows admin/member/business/api.
- Works locally and in production with correct base URL.

—

Напиши “B07” — пришлю следующий блок (Core UI Components & Form System) в .md формате по шагам.
