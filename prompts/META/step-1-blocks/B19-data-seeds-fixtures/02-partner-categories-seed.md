# 02-partner-categories-seed.md

## Title

Seed — Partner Categories

## Objective

Insert safe partner categories; exclude high-risk.

## File

scripts/seed/categories.ts

```ts
import 'dotenv/config';
import { db } from '@/lib/db';
import { categories } from '@/db/schema/catalog';
import { eq } from 'drizzle-orm';

const list = [
  { name: 'Hotels', slug: 'hotels' },
  { name: 'Restaurants', slug: 'restaurants' },
  { name: 'Co-working', slug: 'co-working' },
  { name: 'Logistics', slug: 'logistics' },
  { name: 'Marketing', slug: 'marketing' },
  { name: 'Legal Services', slug: 'legal-services' },
  { name: 'Education', slug: 'education' },
  { name: 'Healthcare', slug: 'healthcare' }
];

async function ensureCategory(name: string, slug: string) {
  const inserted = await db
    .insert(categories)
    .values({ name, slug })
    .onConflictDoNothing()
    .returning({ id: categories.id });

  if (inserted[0]?.id) return inserted[0].id;

  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  return existing[0]?.id ?? null;
}

async function main() {
  for (const c of list) {
    await ensureCategory(c.name, c.slug);
  }
  console.log('✓ Seeded categories');
}

main().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
```

## Acceptance

- Categories inserted, no high-risk slugs present.
- Re-running script does not duplicate rows.
