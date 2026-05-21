# 03-submit-business-form.md

## Title

Submit Business (VIP-only) — MVP fields, validation, UNDER_REVIEW status

## Objective

Allow VIP members to submit exactly one business for review.

Fields (MVP):

- business name, representative name, email, phone, country, city, category, website/social link, short description.

## Steps

1. Guard route via requireVipActive().
2. Enforce “one business per owner” rule.
3. Use RHF+Zod on client and a Server Action to insert UNDER_REVIEW.
4. Record audit log.

## Files to add

- src/app/(business)/submit/page.tsx
- src/features/business/server/owner.ts
- src/features/business/server/actions.ts

### src/features/business/server/owner.ts

```ts
import { eq } from 'drizzle-orm';
import 'server-only';

import { businesses } from '@/db/schema/catalog';
import { db } from '@/lib/db';

export async function getOwnerBusinessCount(userId: string) {
  const rows = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.ownerUserId, userId))
    .limit(2);
  return rows.length;
}
```

### src/features/business/server/actions.ts

```ts
'use server';

import { auth } from '@clerk/nextjs/server';
import 'server-only';
import { z } from 'zod';

import { businesses } from '@/db/schema/catalog';
import { logAudit } from '@/features/audit/server/log';
import { db } from '@/lib/db';

import { getOwnerBusinessCount } from './owner';

const schema = z.object({
  name: z.string().min(2).max(200),
  representativeName: z.string().min(2).max(160),
  email: z.string().email().max(256),
  phone: z.string().min(5).max(50).optional(),
  countryId: z.coerce.number().int().positive(),
  cityId: z.coerce.number().int().positive(),
  categoryId: z.coerce.number().int().positive(),
  websiteUrl: z.string().url().max(512).optional(),
  shortDescription: z.string().max(280).optional(),
});

export async function submitBusiness(formData: FormData) {
  const { userId } = auth();
  if (!userId) return { ok: false, error: 'UNAUTHORIZED' };

  const existing = await getOwnerBusinessCount(userId);
  if (existing >= 1) return { ok: false, error: 'LIMIT_REACHED' };

  const input = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten() };

  const [row] = await db
    .insert(businesses)
    .values({
      ownerUserId: userId,
      name: parsed.data.name,
      representativeName: parsed.data.representativeName,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      countryId: parsed.data.countryId,
      cityId: parsed.data.cityId,
      categoryId: parsed.data.categoryId,
      websiteUrl: parsed.data.websiteUrl ?? null,
      shortDescription: parsed.data.shortDescription ?? null,
      status: 'UNDER_REVIEW' as any,
    })
    .returning();

  await logAudit({
    action: 'BUSINESS_SUBMIT',
    entity: 'business',
    entityId: row.id,
    meta: { name: row.name },
  });

  return { ok: true, id: row.id };
}
```

### src/app/(business)/submit/page.tsx

```tsx
import { auth } from '@clerk/nextjs/server';

import { Section } from '@/components/ui/section';
import { requireVipActive } from '@/features/auth/server/guards';
import { submitBusiness } from '@/features/business/server/actions';
import { getOwnerBusinessCount } from '@/features/business/server/owner';
import {
  getAllCountries,
  getCategories,
  getCitiesByCountry,
} from '@/features/catalog/server/dicts';

export default async function SubmitBusinessPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  await requireVipActive();
  const { userId } = auth();
  if (!userId) return null;

  const count = await getOwnerBusinessCount(userId);
  if (count >= 1) {
    return (
      <Section>
        <h1 className="h2">Submit Business</h1>
        <p className="mt-3 text-sm text-fgMuted">
          You already submitted a business. One business per VIP member in MVP.
        </p>
      </Section>
    );
  }

  const countryPref = Number(searchParams.countryId || '') || undefined;
  const [countries, categories, cities] = await Promise.all([
    getAllCountries(),
    getCategories(),
    getCitiesByCountry(countryPref),
  ]);

  return (
    <Section>
      <h1 className="h2">Submit Business</h1>
      <p className="mt-2 body-sm text-fgMuted">
        Your business will be reviewed before publication.
      </p>

      <form action={submitBusiness} className="mt-6 grid gap-4 max-w-2xl">
        <div className="grid gap-1.5">
          <label className="text-sm font-medium" htmlFor="name">
            Business name
          </label>
          <input
            id="name"
            name="name"
            required
            className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold"
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium" htmlFor="representativeName">
            Representative name
          </label>
          <input
            id="representativeName"
            name="representativeName"
            required
            className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold"
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium" htmlFor="email">
            Business email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold"
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium" htmlFor="phone">
            Phone (optional)
          </label>
          <input
            id="phone"
            name="phone"
            className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold"
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium" htmlFor="countryId">
            Country
          </label>
          <select
            id="countryId"
            name="countryId"
            required
            className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold"
          >
            <option value="">Select country…</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium" htmlFor="cityId">
            City
          </label>
          <select
            id="cityId"
            name="cityId"
            required
            className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold"
          >
            <option value="">Select city…</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium" htmlFor="categoryId">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold"
          >
            <option value="">Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium" htmlFor="websiteUrl">
            Website or social link (optional)
          </label>
          <input
            id="websiteUrl"
            name="websiteUrl"
            placeholder="https://…"
            className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold"
          />
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium" htmlFor="shortDescription">
            Short description (optional)
          </label>
          <textarea
            id="shortDescription"
            name="shortDescription"
            maxLength={280}
            className="min-h-24 rounded-md border border-border bg-card px-3 py-2 focus-gold"
          />
        </div>

        <button className="gold-gradient text-fgOnGold rounded-md px-6 py-3 shadow-cta focus-gold">
          Submit for review
        </button>
      </form>

      <p className="mt-4 text-xs text-fgMuted">
        High-risk categories (crypto, gambling, adult, firearms, unlicensed finance, high-risk
        investments) are not allowed.
      </p>
    </Section>
  );
}
```

## Acceptance

- /business/submit accessible only to VIP users without an existing business.
- Submission creates UNDER_REVIEW business and an audit log.
- Form validates and uses large, mobile-friendly inputs.
