import 'server-only';

import { asc, and, eq, isNull } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

import { db } from '@/db/client';
import { businesses, cities, countries } from '@/db/schema';

export const getCachedCountries = unstable_cache(
  async () =>
    db.query.countries.findMany({
      orderBy: [asc(countries.name)],
    }),
  ['reference-countries'],
  { revalidate: 3600 },
);

export const getCachedCities = unstable_cache(
  async () =>
    db.query.cities.findMany({
      orderBy: [asc(cities.name)],
      with: { country: true },
    }),
  ['reference-cities'],
  { revalidate: 3600 },
);

export const getCachedPublishedBusinessOptions = unstable_cache(
  async () =>
    db.query.businesses.findMany({
      columns: {
        id: true,
        name: true,
      },
      orderBy: [asc(businesses.name)],
      where: and(eq(businesses.status, 'PUBLISHED'), isNull(businesses.deletedAt)),
      with: {
        category: { columns: { name: true } },
        city: { columns: { name: true } },
        country: { columns: { name: true } },
      },
    }),
  ['reference-published-business-options'],
  { revalidate: 300 },
);
