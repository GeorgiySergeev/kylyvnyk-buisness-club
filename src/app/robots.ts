// src/app/robots.ts
import type { MetadataRoute } from 'next';

import { env } from '@/lib/env';

/**
 * Next.js 15 Metadata Route — generated /robots.txt
 *
 * Rules (per SPEC + AGENTS.md §8 / §5):
 *  - Private areas (/m/*, /admin/*, /api/*) must not be indexed.
 *  - /verify-card/[number] has page-level `robots: noindex` but we
 *    add a Disallow as a defence-in-depth measure.
 *  - /sitemap.xml is explicitly advertised.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/m', '/api', '/verify-card'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
