# 05-introductions-management-stub.md

## Title

Business Introductions — admin management stub (no MLM, no payouts)

## Objective

Provide a simple admin UI to review “Introductions”:

- List recent INTRODUCTIONS with status.
- Change status to APPROVED/REJECTED/CLOSED.
- Store internal notes (admin only).
- Log changes.

## Steps

1) Add server actions for updating introduction status/notes.
2) Render a table of recent introductions.
3) Add small inline form for status and notes.

## Files to add/modify

- src/features/admin/server/introductions-actions.ts
- src/features/admin/server/introductions-list.ts
- src/app/(admin)/introductions/page.tsx

### src/features/admin/server/introductions-actions.ts

```ts
'use server';

import 'server-only';
import { db } from '@/lib/db';
import { introductions } from '@/db/schema/membership';
import { eq } from 'drizzle-orm';
import { logAudit } from '@/features/audit/server/log';

export async function updateIntroduction(formData: FormData) {
  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');
  const notes = String(formData.get('internalNotes') || '');

  if (!id || !['APPROVED','REJECTED','CLOSED','SUBMITTED','DRAFT'].includes(status)) {
    throw new Error('Invalid payload');
  }

  await db
    .update(introductions)
    .set({ status: status as any, internalNotes: notes || null, updatedAt: new Date() })
    .where(eq(introductions.id, id));

  await logAudit({ action: 'INTRODUCTION_UPDATE', entity: 'introduction', entityId: id, meta: { status } });
}
```

### src/features/admin/server/introductions-list.ts

```ts
import 'server-only';
import { db } from '@/lib/db';
import { introductions } from '@/db/schema/membership';
import { businesses } from '@/db/schema/catalog';
import { users } from '@/db/schema/user';
import { desc, eq } from 'drizzle-orm';

export async function listRecentIntroductions(limit = 50) {
  const rows = await db
    .select({
      id: introductions.id,
      status: introductions.status,
      internalNotes: introductions.internalNotes,
      createdAt: introductions.createdAt,
      userId: introductions.createdByUserId,
      businessId: introductions.targetBusinessId,
      businessName: businesses.name,
      userEmail: users.email,
    })
    .from(introductions)
    .leftJoin(businesses, eq(businesses.id, introductions.targetBusinessId))
    .leftJoin(users, eq(users.id, introductions.createdByUserId))
    .orderBy(desc(introductions.createdAt))
    .limit(limit);

  return rows;
}
```

### src/app/(admin)/introductions/page.tsx

```tsx
import { listRecentIntroductions } from '@/features/admin/server/introductions-list';
import { updateIntroduction } from '@/features/admin/server/introductions-actions';
import { SsrTable } from '@/components/admin/ssr-table';

function StatusForm({ id, curr, notes }: { id: string; curr: string; notes: string | null }) {
  return (
    <form action={updateIntroduction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={curr} className="rounded-md border border-border bg-card px-2 py-1 text-xs">
        <option value="SUBMITTED">SUBMITTED</option>
        <option value="APPROVED">APPROVED</option>
        <option value="REJECTED">REJECTED</option>
        <option value="CLOSED">CLOSED</option>
      </select>
      <textarea
        name="internalNotes"
        placeholder="Internal notes"
        defaultValue={notes ?? ''}
        className="min-h-16 rounded-md border border-border bg-card px-2 py-1 text-xs"
      />
      <button className="px-3 py-1 rounded-md border border-border hover:bg-bgElev text-xs">Save</button>
    </form>
  );
}

export default async function AdminIntroductionsPage() {
  const rows = await listRecentIntroductions(50);

  return (
    <section>
      <h1 className="h2">Introductions</h1>
      <SsrTable
        columns={[
          { key: 'user', header: 'User' },
          { key: 'business', header: 'Business' },
          { key: 'status', header: 'Status' },
          { key: 'created', header: 'Created', width: '180px' },
          { key: 'actions', header: 'Edit', width: '220px' },
        ]}
        rows={rows.map((r) => ({
          user: r.userEmail ?? r.userId,
          business: r.businessName ?? r.businessId,
          status: r.status,
          created: new Date(r.createdAt).toLocaleString(),
          actions: <StatusForm id={r.id} curr={r.status as any} notes={r.internalNotes} />,
        }))}
      />
      <p className="mt-3 text-xs text-fgMuted">
        No commissions, bonuses or MLM mechanics. Admin-only internal processing.
      </p>
    </section>
  );
}
```

## Acceptance

- Admin can update introduction status and notes.
- Audit logs capture changes.
- No references to payouts/commissions are shown.
