# 06-audit-logs-minimal.md

## Title

Audit Logs — minimal admin viewer (recent CRUD events)

## Objective

Provide a minimal, read-only list of recent audit logs with paging.

## Steps

1. Add server list with basic filters (later expandable).
2. Render SSR table with action, entity, timestamp, actor.
3. Do not display PII in meta; show length or keys count only if needed.

## Files to add/modify

- src/features/admin/server/audit-list.ts
- src/app/(admin)/logs/page.tsx (render table + pager)

### src/features/admin/server/audit-list.ts

```ts
import { desc, eq } from 'drizzle-orm';
import 'server-only';

import { auditLogs } from '@/db/schema/audit';
import { users } from '@/db/schema/user';
import { db } from '@/lib/db';

export async function listAudit({ page, pageSize }: { page: number; pageSize: number }) {
  const offset = (page - 1) * pageSize;
  const rows = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entity: auditLogs.entity,
      entityId: auditLogs.entityId,
      createdAt: auditLogs.createdAt,
      actorEmail: users.email,
    })
    .from(auditLogs)
    .leftJoin(users, eq(users.id, auditLogs.actorUserId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { rows, totalHint: undefined as number | undefined };
}
```

### src/app/(admin)/logs/page.tsx

```tsx
import { Pager, SsrTable } from '@/components/admin/ssr-table';
import { listAudit } from '@/features/admin/server/audit-list';
import { parsePage } from '@/features/admin/server/listing';

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const pg = parsePage(searchParams);
  const { rows, totalHint } = await listAudit(pg);

  return (
    <section>
      <h1 className="h2">Audit Logs</h1>
      <SsrTable
        columns={[
          { key: 'action', header: 'Action' },
          { key: 'entity', header: 'Entity' },
          { key: 'entityId', header: 'Entity ID' },
          { key: 'actor', header: 'Actor' },
          { key: 'when', header: 'When', width: '180px' },
        ]}
        rows={rows.map((r) => ({
          action: r.action,
          entity: r.entity,
          entityId: r.entityId,
          actor: r.actorEmail ?? 'system',
          when: new Date(r.createdAt).toLocaleString(),
        }))}
      />
      <Pager
        totalHint={totalHint}
        page={pg.page}
        pageSize={pg.pageSize}
        pathname="/admin/logs"
        searchParams={searchParams}
      />
      <p className="mt-3 text-xs text-fgMuted">
        Metadata may be stored internally but is not displayed here to avoid PII exposure.
      </p>
    </section>
  );
}
```

## Acceptance

- Admin can view recent audit logs with actor email (or “system”).
- No PII/meta details are rendered.
- Paging works via URL params.

—
