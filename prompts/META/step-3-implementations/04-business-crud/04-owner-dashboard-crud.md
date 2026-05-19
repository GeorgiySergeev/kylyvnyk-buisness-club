# step-3-implementations/04-business-crud/04-owner-dashboard-crud.md

## Title

Owner Dashboard — basic edit + re‑review

## Objective

Дать владельцу (VIP) посмотреть статус и отредактировать базовые поля (email/phone/website/shortDescription, при необходимости representativeName). После редактирования бизнес возвращается в UNDER_REVIEW для повторной проверки.

## Files

### src/features/business/server/queries.ts (добавить getMyBusiness)

```ts
import 'server-only';
import { db } from '@/lib/db';
import { businesses, categories } from '@/db/schema/catalog';
import { eq } from 'drizzle-orm';

export async function getMyBusiness(userId: string) {
  const row = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      representativeName: businesses.representativeName,
      email: businesses.email,
      phone: businesses.phone,
      websiteUrl: businesses.websiteUrl,
      shortDescription: businesses.shortDescription,
      status: businesses.status,
      category: categories.name,
    })
    .from(businesses)
    .leftJoin(categories, eq(categories.id, businesses.categoryId))
    .where(eq(businesses.ownerUserId, userId))
    .limit(1);
  return row[0] ?? null;
}
```

### src/features/business/server/actions.ts (добавить updateBusinessBasics)

```ts
'use server';

import 'server-only';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { businesses } from '@/db/schema/catalog';
import { eq } from 'drizzle-orm';
import { ensureNoBannedKeywords } from '@/features/compliance/guards';
import { logAudit } from '@/features/audit/server/log';

const editSchema = z.object({
  id: z.string().uuid(),
  representativeName: z.string().min(2).max(160).optional(),
  email: z.string().email().max(256).optional(),
  phone: z.string().min(5).max(50).optional().or(z.literal('').transform(() => undefined)),
  websiteUrl: z.string().url().max(512).optional().or(z.literal('').transform(() => undefined)),
  shortDescription: z.string().max(280).optional().or(z.literal('').transform(() => undefined)),
});

export async function updateBusinessBasics(formData: FormData) {
  const { userId } = auth();
  if (!userId) return { ok: false, error: 'UNAUTHORIZED' };

  const input = Object.fromEntries(formData.entries());
  const parsed = editSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten() };

  // Владелец только свой бизнес
  const id = parsed.data.id;
  const own = await db
    .select({ id: businesses.id, ownerUserId: businesses.ownerUserId, name: businesses.name })
    .from(businesses)
    .where(eq(businesses.id, id))
    .limit(1);

  if (!own[0] || own[0].ownerUserId !== userId) {
    return { ok: false, error: 'FORBIDDEN' };
  }

  ensureNoBannedKeywords([parsed.data.shortDescription, parsed.data.websiteUrl]);

  // Обновляем поля и переводим в UNDER_REVIEW для повторной модерации
  await db
    .update(businesses)
    .set({
      representativeName: parsed.data.representativeName ?? undefined,
      email: parsed.data.email ?? undefined,
      phone: parsed.data.phone ?? null,
      websiteUrl: parsed.data.websiteUrl ?? null,
      shortDescription: parsed.data.shortDescription ?? null,
      status: 'UNDER_REVIEW' as any,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, id));

  await logAudit({ action: 'BUSINESS_EDIT_REQUEST', entity: 'business', entityId: id });

  return { ok: true };
}
```

### src/app/(business)/page.tsx (владельческий дашборд с формой)

```tsx
import { requireVipActive } from '@/features/auth/server/guards';
import { auth } from '@clerk/nextjs/server';
import { Section } from '@/components/ui/section';
import { getMyBusiness } from '@/features/business/server/queries';
import { updateBusinessBasics } from '@/features/business/server/actions';
import BusinessStatusPanel from '@/features/business/business-status-panel';

export default async function BusinessHome() {
  await requireVipActive();
  const { userId } = auth();
  if (!userId) return null;

  const biz = await getMyBusiness(userId);

  return (
    <Section>
      <h1 className="h2">My Business</h1>
      <p className="mt-1 body-sm text-fgMuted">Status of your business profile and basic info.</p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <BusinessStatusPanel />
        </div>

        <div>
          <h2 className="h3 mb-3">Edit basic info</h2>
          {!biz ? (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-fgMuted">
              No business submitted yet. <a href="/business/submit" className="underline hover:text-gold-400">Submit now</a>.
            </div>
          ) : (
            <form action={updateBusinessBasics} className="grid gap-3" noValidate>
              <input type="hidden" name="id" value={biz.id} />
              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="representativeName">Representative name</label>
                <input id="representativeName" name="representativeName" defaultValue={biz.representativeName ?? ''} className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold" />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="email">Business email</label>
                <input id="email" type="email" name="email" defaultValue={biz.email ?? ''} className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold" />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="phone">Phone (optional)</label>
                <input id="phone" name="phone" defaultValue={biz.phone ?? ''} className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold" />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="websiteUrl">Website or social link (optional)</label>
                <input id="websiteUrl" name="websiteUrl" defaultValue={biz.websiteUrl ?? ''} placeholder="https://…" className="min-h-11 rounded-md border border-border bg-card px-3 py-2 focus-gold" />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium" htmlFor="shortDescription">Short description (optional)</label>
                <textarea id="shortDescription" name="shortDescription" defaultValue={biz.shortDescription ?? ''} maxLength={280} className="min-h-24 rounded-md border border-border bg-card px-3 py-2 focus-gold" />
              </div>

              <button className="px-5 py-3 rounded-md border border-border hover:bg-bgElev focus-gold">Request re‑review</button>

              <p className="mt-2 text-xs text-fgMuted">
                After changes your business goes back to UNDER_REVIEW until an admin approves it.
              </p>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}
```

## Acceptance

- Владелец видит текущий статус и базовые данные.
- Редактирование доступно, изменения переводят статус в UNDER_REVIEW.
- Комплаенс‑фильтры и аудит‑лог активны; чужой бизнес править нельзя.