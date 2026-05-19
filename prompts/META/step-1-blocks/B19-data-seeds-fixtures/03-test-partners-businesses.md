# 03-test-partners-businesses.md

## Title

Seed — Test Partners/Businesses

## Objective

Create a few businesses (UNDER_REVIEW and PUBLISHED) with flags for landing (Top/Recommended). Uses an existing or shadow user as owner.

## File

scripts/seed/businesses.ts

```ts
import 'dotenv/config';
import { db } from '@/lib/db';
import { users } from '@/db/schema/user';
import { businesses } from '@/db/schema/catalog';
import { eq } from 'drizzle-orm';

async function getOrCreateShadowUser() {
  // Try to use any existing user
  const any = await db.select({ id: users.id }).from(users).limit(1);
  if (any[0]?.id) return any[0].id;

  const [created] = await db
    .insert(users)
    .values({
      clerkUserId: 'dev-shadow-user',
      email: 'shadow@example.com',
      isAdmin: false,
      status: 'ACTIVE' as any
    })
    .onConflictDoNothing()
    .returning({ id: users.id });

  if (created?.id) return created.id;

  // If conflict (exists), fetch it
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, 'dev-shadow-user'))
    .limit(1);

  if (!existing[0]) throw new Error('Failed to ensure shadow user');
  return existing[0].id;
}

async function main() {
  const ownerUserId = await getOrCreateShadowUser();

  const samples = [
    {
      name: 'Aurora Hotel',
      representativeName: 'Jane Smith',
      email: 'contact@aurora.example',
      phone: null,
      countryId: 1,
      cityId: 1,
      categoryId: 1,
      websiteUrl: 'https://aurora.example',
      shortDescription: 'Premium city hotel.',
      status: 'PUBLISHED' as any,
      isTopPartner: true,
      isRecommended: false
    },
    {
      name: 'Golden Fork',
      representativeName: 'Ivan Petrov',
      email: 'hello@gfork.example',
      phone: null,
      countryId: 2,
      cityId: 4,
      categoryId: 2,
      websiteUrl: 'https://gfork.example',
      shortDescription: 'Fine dining experience.',
      status: 'PUBLISHED' as any,
      isTopPartner: false,
      isRecommended: true
    },
    {
      name: 'Swift Logistics',
      representativeName: 'Olga K.',
      email: 'ops@swiftlog.example',
      phone: null,
      countryId: 1,
      cityId: 3,
      categoryId: 4,
      websiteUrl: 'https://swiftlog.example',
      shortDescription: 'Fast and reliable logistics.',
      status: 'UNDER_REVIEW' as any,
      isTopPartner: false,
      isRecommended: false
    }
  ];

  for (const s of samples) {
    await db
      .insert(businesses)
      .values({ ownerUserId, ...s })
      .onConflictDoNothing();
  }

  console.log('✓ Seeded businesses (2 published, 1 under review)');
}

main().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
```

## Acceptance

- At least 2 PUBLISHED and 1 UNDER_REVIEW businesses exist.
- One Top Partner and one Recommended appear for landing sections.
- Re-running script keeps data idempotent.
