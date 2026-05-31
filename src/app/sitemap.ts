// src/app/sitemap.ts
import type { MetadataRoute } from 'next';

import { and, asc, isNull } from 'drizzle-orm';
import { eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { businesses } from '@/db/schema';
import { env } from '@/lib/env';
import { SUPPORTED_LOCALES } from '@/components/layout/navigation';

/**
 * Next.js 15 Metadata Route — generated /sitemap.xml
 *
 * Includes:
 *  - Static public marketing routes (home, directory, verify-card index)
 *  - Legal pages
 *  - Dynamic /directory/[slug] for all PUBLISHED businesses
 *
 * Excludes private routes (/m/*, /admin/*, /api/*) — covered by robots.ts.
 *
 * Note: only the `en` locale is active for MVP. Additional locales (ru, uk)
 * are Phase-2, so we generate en-only paths to avoid broken alternate hrefs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  // ── Static routes ────────────────────────────────────────────────────────
  const staticPaths = [
    '/',
    '/directory',
    '/verify-card',
    '/legal/terms',
    '/legal/privacy',
    '/legal/cookie',
    '/legal/refund',
    '/legal/rules/club',
    '/legal/rules/partner',
    '/legal/rules/introduction',
    '/legal/disclaimer',
    '/legal/contact',
  ] as const;

  const staticEntries: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${baseUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '/' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '/' ? 1.0 : path === '/directory' ? 0.9 : 0.6,
    })),
  );

  // ── Dynamic routes: /directory/[slug] ────────────────────────────────────
  let publishedSlugs: { slug: string; updatedAt: Date }[] = [];

  try {
    publishedSlugs = await db
      .select({ slug: businesses.slug, updatedAt: businesses.updatedAt })
      .from(businesses)
      .where(and(eq(businesses.status, 'PUBLISHED'), isNull(businesses.deletedAt)))
      .orderBy(asc(businesses.slug));
  } catch {
    // Sitemap generation must not crash the build; return static entries only.
  }

  const dynamicEntries: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) =>
    publishedSlugs.map(({ slug, updatedAt }) => ({
      url: `${baseUrl}/${locale}/directory/${encodeURIComponent(slug)}`,
      lastModified: updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  );

  return [...staticEntries, ...dynamicEntries];
}
