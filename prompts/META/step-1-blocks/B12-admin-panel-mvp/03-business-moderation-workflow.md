# 03-business-moderation-workflow.md

## Title

Business Moderation — UNDER_REVIEW → PUBLISHED/HIDDEN + flags

## Objective

Provide admin controls to:

- Publish or hide a business.
- Toggle Top Partner / Recommended flags.
- Set publishedAt upon publish.
- Log actions to AuditLog.

## Steps

1) Create server actions for moderation.
2) Enhance Businesses table with action buttons per row.
3) Record audit logs for each change.

## Files to add/modify

- src/features/admin/server/business-actions.ts
- src/app/(admin)/businesses/page.tsx (add forms/buttons)
- src/features/audit/server/log.ts (already exists)

### src/features/admin/server/business-actions.ts

```ts
'use server';

import 'server-only';
import { db } from '@/lib/db';
import { businesses } from '@/db/schema/catalog';
import { eq } from 'drizzle-orm';
import { logAudit } from '@/features/audit/server/log';
import { revalidatePath } from 'next/cache';

export async function publishBusiness(id: string) {
  await db
    .update(businesses)
    .set({ status: 'PUBLISHED' as any, publishedAt: new Date() })
    .where(eq(businesses.id, id));
  await logAudit({ action: 'BUSINESS_PUBLISH', entity: 'business', entityId: id });
  revalidatePath('/catalog'); // refresh public catalog
}

export async function hideBusiness(id: string) {
  await db
    .update(businesses)
    .set({ status: 'HIDDEN' as any })
    .where(eq(businesses.id, id));
  await logAudit({ action: 'BUSINESS_HIDE', entity: 'business', entityId: id });
  revalidatePath('/catalog');
}

export async function markUnderReview(id: string) {
  await db
    .update(businesses)
    .set({ status: 'UNDER_REVIEW' as any })
    .where(eq(businesses.id, id));
  await logAudit({ action: 'BUSINESS_UNDER_REVIEW', entity: 'business', entityId: id });
}

export async function toggleTop(id: string, value: boolean) {
  await db.update(businesses).set({ isTopPartner: value }).where(eq(businesses.id, id));
  await logAudit({ action: value ? 'BUSINESS_TOP_SET' : 'BUSINESS_TOP_UNSET', entity: 'business', entityId: id });
  revalidatePath('/'); // landing
}

export async function toggleRecommended(id: string, value: boolean) {
  await db.update(businesses).set({ isRecommended: value }).where(eq(businesses.id, id));
  await logAudit({ action: value ? 'BUSINESS_REC_SET' : 'BUSINESS_REC_UNSET', entity: 'business', entityId: id });
  revalidatePath('/'); // landing
}
```

### src/app/(admin)/businesses/page.tsx (actions UI patch)

```tsx
import { parsePage, listBusinesses } from '@/features/admin/server/listing';
import { SsrTable, Pager } from '@/components/admin/ssr-table';
import { publishBusiness, hideBusiness, markUnderReview, toggleTop, toggleRecommended } from '@/features/admin/server/business-actions';

function ActionButtons({ id, status, isTop, isRec }: { id: string; status: string; isTop: boolean; isRec: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={async () => { 'use server'; await publishBusiness(id); }}>
        <button className="px-3 py-1 rounded-md border border-border hover:bg-bgElev text-xs">Publish</button>
      </form>
      <form action={async () => { 'use server'; await hideBusiness(id); }}>
        <button className="px-3 py-1 rounded-md border border-border hover:bg-bgElev text-xs">Hide</button>
      </form>
      <form action={async () => { 'use server'; await markUnderReview(id); }}>
        <button className="px-3 py-1 rounded-md border border-border hover:bg-bgElev text-xs">Under Review</button>
      </form>
      <form action={async () => { 'use server'; await toggleTop(id, !isTop); }}>
        <button className="px-3 py-1 rounded-md border border-border hover:bg-bgElev text-xs">{isTop ? 'Unset Top' : 'Set Top'}</button>
      </form>
      <form action={async () => { 'use server'; await toggleRecommended(id, !isRec); }}>
        <button className="px-3 py-1 rounded-md border border-border hover:bg-bgElev text-xs">{isRec ? 'Unset Rec' : 'Set Rec'}</button>
      </form>
    </div>
  );
}

export default async function AdminBusinessesPage({ searchParams }: { searchParams: Record<string, string> }) {
  const pg = parsePage(searchParams);
  const { rows } = await listBusinesses(pg);

  return (
    <section>
      <h1 className="h2">Businesses</h1>
      <SsrTable
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'status', header: 'Status', width: '140px' },
          { key: 'flags', header: 'Flags', width: '160px' },
          { key: 'createdAt', header: 'Created', width: '180px' },
          { key: 'actions', header: '', width: '360px' },
        ]}
        rows={rows.map((r) => ({
          name: r.name,
          status: r.status,
          flags: (
            <div className="text-xs text-fgMuted">
              Top: {r.isTop ? 'Yes' : 'No'} · Rec: {r.isRec ? 'Yes' : 'No'}
            </div>
          ),
          createdAt: new Date(r.createdAt).toLocaleString(),
          actions: <ActionButtons id={r.id} status={r.status as any} isTop={r.isTop} isRec={r.isRec} />,
        }))}
      />
      <Pager page={pg.page} pageSize={pg.pageSize} pathname="/admin/businesses" searchParams={searchParams} />
    </section>
  );
}
```

## Acceptance

- Admin can publish/hide/under-review a business.
- Top Partner and Recommended toggles work.
- Audit logs recorded; public pages revalidated appropriately.
