# 04-partner-details-page.md

## Title

Partner Details — PUBLISHED only, special conditions gated after sign‑in

## Objective

Create details page /catalog/[id] showing published business info: logo/monogram, name, category, location, website, short description. If user is signed in, show partner offers (PRIVATE_AFTER_LOGIN); guests see a privacy note.

## Steps

1. Add server query to get business by id with joins + offers.
2. Create dynamic route /catalog/[id]/page.tsx.
3. Gate special conditions by auth(); never show for guests.

## Files to add

- src/features/catalog/server/get-business.ts
- src/app/(public)/catalog/[id]/page.tsx
- src/app/(public)/catalog/[id]/loading.tsx (S06)
- Reuse BusinessCard monogram idea if no logo.

### src/features/catalog/server/get-business.ts

```ts
import { and, eq } from 'drizzle-orm';
import 'server-only';

import { businesses, categories, partnerOffers } from '@/db/schema/catalog';
import { cities, countries } from '@/db/schema/geo';
import { db } from '@/lib/db';

export async function getPublishedBusiness(id: string) {
  const rows = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      shortDescription: businesses.shortDescription,
      websiteUrl: businesses.websiteUrl,
      category: categories.name,
      country: countries.name,
      city: cities.name,
    })
    .from(businesses)
    .leftJoin(categories, eq(categories.id, businesses.categoryId))
    .leftJoin(countries, eq(countries.id, businesses.countryId))
    .leftJoin(cities, eq(cities.id, businesses.cityId))
    .where(and(eq(businesses.id, id), eq(businesses.status, 'PUBLISHED' as any)))
    .limit(1);

  const business = rows[0];
  if (!business) return null;

  const offers = await db
    .select({
      id: partnerOffers.id,
      shortText: partnerOffers.shortText,
      validTo: partnerOffers.validTo,
    })
    .from(partnerOffers)
    .where(eq(partnerOffers.businessId, id))
    .orderBy(partnerOffers.priority);

  return { ...business, offers };
}
```

### src/app/(public)/catalog/[id]/page.tsx

```tsx
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CardPremium } from '@/components/ui/card-premium';
import { getPublishedBusiness } from '@/features/catalog/server/get-business';

function Monogram({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div className="flex size-12 items-center justify-center rounded-md border border-border bg-bgElev text-gold font-bold">
      {initials}
    </div>
  );
}

export default async function PartnerDetailsPage({ params }: { params: { id: string } }) {
  const data = await getPublishedBusiness(params.id);
  if (!data) notFound();

  const { userId } = auth();
  const reveal = Boolean(userId);

  return (
    <main className="container py-10">
      <div className="flex items-center gap-4">
        <Monogram name={data.name} />
        <div>
          <h1 className="h2">{data.name}</h1>
          <p className="text-sm text-fgMuted">
            {data.category ?? '—'} • {data.country ?? '—'}, {data.city ?? '—'}
          </p>
        </div>
      </div>

      {data.websiteUrl && (
        <p className="mt-3">
          <a
            href={data.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline hover:text-gold-400"
          >
            Visit website
          </a>
        </p>
      )}

      {data.shortDescription && <p className="mt-5 body">{data.shortDescription}</p>}

      <section className="mt-8 space-y-3">
        <h2 className="h3">Special conditions</h2>

        {!reveal && (
          <CardPremium className="text-sm text-fgMuted">
            Special conditions are available after registration. Please{' '}
            <Link href="/sign-in" className="underline hover:text-gold-400">
              sign in
            </Link>{' '}
            or{' '}
            <Link href="/sign-up" className="underline hover:text-gold-400">
              create a free account
            </Link>
            .
          </CardPremium>
        )}

        {reveal && data.offers.length === 0 && (
          <CardPremium className="text-sm text-fgMuted">No active offers.</CardPremium>
        )}

        {reveal && data.offers.length > 0 && (
          <div className="grid gap-3">
            {data.offers.map((o) => (
              <CardPremium key={o.id} className="text-sm">
                <div className="font-medium text-gold-400">{o.shortText}</div>
                {o.validTo && (
                  <div className="text-xs text-fgMuted mt-1">
                    Valid until {new Date(o.validTo).toLocaleDateString()}
                  </div>
                )}
              </CardPremium>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
```

## Acceptance

- 404 for non-existent or non-PUBLISHED businesses.
- Guests see gating note; signed-in users see offers.
- No PII/stats beyond allowed fields.
