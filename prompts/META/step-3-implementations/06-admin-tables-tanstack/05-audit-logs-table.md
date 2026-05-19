# step-3-implementations/06-admin-tables-tanstack/05-audit-logs-table.md

## Title

Admin — Audit Logs table with filters

## Objective

Список последних событий аудита с фильтрами по action/entity и датам (минимально).

## Files

### src/app/(admin)/logs/page.tsx

```tsx
import { parsePage } from '@/features/admin/server/listing';
import { db } from '@/lib/db';
import { auditLogs } from '@/db/schema/audit';
import { users } from '@/db/schema/user';
import { and, desc, gte, lte, or, sql, eq } from 'drizzle-orm';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Pager } from '@/components/admin/ssr-table';

type Row = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  actorEmail: string | null;
  createdAt: string;
};

function buildWhere(action?: string, entity?: string, from?: string, to?: string) {
  const parts: any[] = [];
  if (action) {
    const pat = `%${action}%`;
    parts.push(sql`action ILIKE ${pat}`);
  }
  if (entity) {
    const pat = `%${entity}%`;
    parts.push(sql`entity ILIKE ${pat}`);
  }
  if (from) {
    parts.push(gte(auditLogs.createdAt, new Date(from)));
  }
  if (to) {
    parts.push(lte(auditLogs.createdAt, new Date(to)));
  }
  if (parts.length === 0) return undefined;
  return and(...parts);
}

export default async function AdminLogsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const pg = parsePage(searchParams);
  const action = (searchParams.action || '').trim();
  const entity = (searchParams.entity || '').trim();
  const from = (searchParams.from || '').trim();
  const to = (searchParams.to || '').trim();

  const where = buildWhere(action, entity, from, to);
  const offset = (pg.page - 1) * pg.pageSize;

  const rowsDb = await db
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
    .where(where ?? sql`true`)
    .orderBy(desc(auditLogs.createdAt))
    .limit(pg.pageSize)
    .offset(offset);

  const rows: Row[] = rowsDb.map((r) => ({
    id: r.id,
    action: r.action,
    entity: r.entity,
    entityId: r.entityId,
    actorEmail: r.actorEmail ?? 'system',
    createdAt: new Date(r.createdAt).toLocaleString(),
  }));

  const columns: ColumnDef<Row>[] = [
    { accessorKey: 'action', header: 'Action' },
    { accessorKey: 'entity', header: 'Entity' },
    { accessorKey: 'entityId', header: 'Entity ID' },
    { accessorKey: 'actorEmail', header: 'Actor' },
    { accessorKey: 'createdAt', header: 'When' },
  ];

  return (
    <section>
      <h1 className="h2">Audit Logs</h1>

      <form method="get" className="mt-3 flex flex-wrap gap-2">
        <input
          type="text"
          name="action"
          defaultValue={action}
          placeholder="Filter action (e.g. BUSINESS_PUBLISH)"
          className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold"
        />
        <input
          type="text"
          name="entity"
          defaultValue={entity}
          placeholder="Filter entity (e.g. business)"
          className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold"
        />
        <input type="date" name="from" defaultValue={from} className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold" />
        <input type="date" name="to" defaultValue={to} className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold" />
        <button className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold">Apply</button>
      </form>

      <DataTable columns={columns} data={rows} className="mt-4" />
      <Pager page={pg.page} pageSize={pg.pageSize} pathname="/admin/logs" searchParams={searchParams as any} />

      <p className="mt-3 text-xs text-fgMuted">
        Metadata is stored internally and not displayed to avoid exposing PII.
      </p>
    </section>
  );
}
```

## Acceptance

- Фильтры по action/entity и датам работают
- Пагинация по URL
- Без вывода PII, только минимально необходимая информация

---

Notes

- При большом объёме данных можно переключить сортировку/фильтры на серверные (обрабатывая searchParams) и отдавать уже отсортированный набор.
- Для экстремальных списков подключите виртуализацию (@tanstack/react-virtual) — не требуется в MVP.
