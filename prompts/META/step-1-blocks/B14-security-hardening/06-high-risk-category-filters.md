# 06-high-risk-category-filters.md

## Title

Compliance Guard — block high-risk categories and keywords

## Objective

Enforce MVP restriction: reject crypto, gambling, adult, firearms, unlicensed finance, high‑risk investments. Validate on submission and on publish.

## Steps

1. Add compliance constants and helper guards.
2. Call guards in submitBusiness (server action).
3. Re-check in admin publish action to prevent accidental exposure.

## Files to add/modify

- src/features/compliance/constants.ts
- src/features/compliance/guards.ts
- Patch:
  - src/features/business/server/actions.ts (on submit)
  - src/features/admin/server/business-actions.ts (on publish)

### src/features/compliance/constants.ts

```ts
export const HIGH_RISK_CATEGORY_SLUGS = new Set([
  'crypto',
  'cryptocurrency',
  'gambling',
  'betting',
  'adult',
  'firearms',
  'weapons',
  'unlicensed-finance',
  'high-risk-investments',
]);

export const BANNED_KEYWORDS = [
  'get rich',
  'guaranteed income',
  'passive income',
  'mlm',
  'pyramid',
  'casino',
  'tokensale',
  'ico',
  'airdrop',
];
```

### src/features/compliance/guards.ts

```ts
import { eq } from 'drizzle-orm';
import 'server-only';

import { categories } from '@/db/schema/catalog';
import { db } from '@/lib/db';

import { BANNED_KEYWORDS, HIGH_RISK_CATEGORY_SLUGS } from './constants';

export async function ensureNotHighRiskCategory(categoryId: number) {
  const cat = await db.query.categories.findFirst({ where: eq(categories.id, categoryId) });
  const slug = (cat?.slug || '').toLowerCase();
  if (HIGH_RISK_CATEGORY_SLUGS.has(slug)) {
    const err = new Error('HIGH_RISK_CATEGORY_FORBIDDEN');
    (err as any).status = 400;
    throw err;
  }
}

export function ensureNoBannedKeywords(texts: Array<string | null | undefined>) {
  const blob = texts.filter(Boolean).join(' ').toLowerCase();
  for (const k of BANNED_KEYWORDS) {
    if (blob.includes(k)) {
      const err = new Error('BANNED_KEYWORDS_DETECTED');
      (err as any).status = 400;
      throw err;
    }
  }
}
```

### Patch submitBusiness (server action)

Inside submitBusiness() before insert:

```ts
import { ensureNoBannedKeywords, ensureNotHighRiskCategory } from '@/features/compliance/guards';

// ...
await ensureNotHighRiskCategory(parsed.data.categoryId);
ensureNoBannedKeywords([parsed.data.name, parsed.data.shortDescription, parsed.data.websiteUrl]);
```

### Patch publishBusiness (admin action)

src/features/admin/server/business-actions.ts (inside publishBusiness before update):

```ts
import { eq } from 'drizzle-orm';

import { businesses, categories } from '@/db/schema/catalog';
import { HIGH_RISK_CATEGORY_SLUGS } from '@/features/compliance/constants';
import { db } from '@/lib/db';

// ...
const row = await db
  .select({ categoryId: businesses.categoryId, name: businesses.name })
  .from(businesses)
  .where(eq(businesses.id, id))
  .limit(1);

const cat = row[0]
  ? await db
      .select({ slug: categories.slug })
      .from(categories)
      .where(eq(categories.id, row[0].categoryId))
      .limit(1)
  : [];

if (cat[0] && HIGH_RISK_CATEGORY_SLUGS.has((cat[0].slug || '').toLowerCase())) {
  throw new Error('HIGH_RISK_CATEGORY_FORBIDDEN');
}
```

## Acceptance

- Attempts to submit or publish high-risk businesses are rejected with 400-level error.
- Banned income/MLM phrases trigger rejection on submission.
- Admin UI displays error message when publish is blocked (bubble up error).

—

Готов продолжить с B15 — i18n & SEO Basics. Напиши “B15”, и пришлю следующий набор .md промтов по шагам.
