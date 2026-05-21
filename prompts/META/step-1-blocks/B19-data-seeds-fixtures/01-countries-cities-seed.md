# 01-countries-cities-seed.md

## Title

Seed — Countries and Cities (subset)

## Objective

Insert a small, realistic set of countries and cities for testing.

## File

scripts/seed/countries-cities.ts

```ts
import 'dotenv/config';
import { eq } from 'drizzle-orm';

import { cities, countries } from '@/db/schema/geo';
import { db } from '@/lib/db';

async function ensureCountry(iso2: string, name: string) {
  // Try insert
  const inserted = await db
    .insert(countries)
    .values({ iso2, name })
    .onConflictDoNothing()
    .returning({ id: countries.id });

  if (inserted[0]?.id) return inserted[0].id;

  // Fallback: select existing
  const existing = await db
    .select({ id: countries.id })
    .from(countries)
    .where(eq(countries.iso2, iso2))
    .limit(1);

  if (!existing[0]) throw new Error(`Failed to upsert country ${iso2}`);
  return existing[0].id;
}

async function ensureCity(countryId: number, name: string) {
  await db.insert(cities).values({ countryId, name }).onConflictDoNothing();
}

async function main() {
  const data = [
    { iso2: 'US', name: 'United States', cities: ['New York', 'Los Angeles', 'Miami'] },
    { iso2: 'UA', name: 'Ukraine', cities: ['Kyiv', 'Lviv', 'Odesa'] },
    { iso2: 'GB', name: 'United Kingdom', cities: ['London', 'Manchester', 'Edinburgh'] },
  ];

  for (const c of data) {
    const countryId = await ensureCountry(c.iso2, c.name);
    for (const city of c.cities) {
      await ensureCity(countryId, city);
    }
  }

  console.log('✓ Seeded countries & cities');
}

main().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
```

## Acceptance

- Geo tables populated with 3 countries and 9 cities.
- Re-running script is safe (no duplicates).
