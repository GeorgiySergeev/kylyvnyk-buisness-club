05-db-access-in-rsc-server-actions.md
Title
DB access patterns — RSC queries and Server Actions (Next.js App Router)

Objective
Show safe, type-first patterns for reading (RSC) and writing (Server Actions) with Drizzle.

Steps
Create feature-level query module (server-only)
Create server action with Zod validation and revalidation
Tag-based cache invalidation for listings
Files to add
src/features/catalog/server/queries.ts
src/features/catalog/server/actions.ts
src/features/catalog/server/queries.ts
ts

copy
import 'server-only';
import { db } from '@/lib/db';
import { businesses } from '@/db/schema/catalog';
import { eq } from 'drizzle-orm';

// RSC-safe read
export async function getPublishedBusinesses(limit = 12) {
// Adjust 'status' literal to match enum in Step 2
const rows = await db
.select()
.from(businesses)
.where(eq(businesses.status, 'PUBLISHED' as any))
.limit(limit);

return rows;
}
src/features/catalog/server/actions.ts
ts

copy
'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { businesses } from '@/db/schema/catalog';

const createBusinessSchema = z.object({
name: z.string().min(2).max(200),
representativeName: z.string().min(2).max(160),
email: z.string().email().max(256),
phone: z.string().optional(),
countryId: z.number().int().positive(),
cityId: z.number().int().positive(),
categoryId: z.number().int().positive(),
websiteUrl: z.string().url().max(512).optional(),
shortDescription: z.string().max(280).optional(),
});

export async function createBusinessAction(formData: FormData) {
const input = Object.fromEntries(formData.entries());
const parsed = createBusinessSchema.safeParse({
name: input.name,
representativeName: input.representativeName,
email: input.email,
phone: input.phone,
countryId: Number(input.countryId),
cityId: Number(input.cityId),
categoryId: Number(input.categoryId),
websiteUrl: input.websiteUrl,
shortDescription: input.shortDescription,
});

if (!parsed.success) {
return { ok: false, errors: parsed.error.flatten() };
}

// Default to UNDER_REVIEW per MVP
await db.insert(businesses).values({
id: undefined, // use default uuid if configured
ownerUserId: undefined as any, // set from session in real impl
status: 'UNDER_REVIEW' as any,
...parsed.data,
});

revalidateTag('catalog:list'); // ensure listings re-fetch
return { ok: true };
}
Notes

Replace ownerUserId with current session user in Step 3 (Auth).
Prefer 'server-only' for read modules to prevent client bundling.
Use cache tags on pages that list catalog items and call revalidateTag on mutations.
