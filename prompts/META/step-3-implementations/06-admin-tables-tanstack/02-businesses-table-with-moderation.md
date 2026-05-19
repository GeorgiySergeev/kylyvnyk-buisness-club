# step-3-implementations/06-admin-tables-tanstack/02-businesses-table-with-moderation.md

## Title

Admin — Businesses table with moderation

## Objective

Интерактивная таблица бизнесов с фильтрами по статусу/поиску и экшенами модерации (publish/hide/under‑review + топ/рекомменд).

## Files

### src/app/(admin)/businesses/page.tsx

```tsx
import { parsePage } from '@/features/admin/server/listing';
import { db } from '@/lib/db';
import { businesses } from '@/db/schema/catalog';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Pager } from '@/components/admin/ssr-table';
import { publishBusiness, hideBusiness, markUnderReview, toggleTop, toggleRecommended } from '@/features/admin/server/business-actions';

type Row = {
  id: string;
  name: string;
  status: 'UNDER_REVIEW' | 'PUBLISHED' | 'HIDDEN';
  isTop: boolean;
  isRec: boolean;
  createdAt: string;
};

function buildWhere(search?: string, status?: string) {
  const parts: any[] = [];
  if (search) {
    const pattern = `%${search}%`;
    parts.push(ilike(businesses.name, pattern as any));
  }
  if (status && ['UNDER_REVIEW', 'PUBLISHED', 'HIDDEN'].includes(status)) {
    parts.push(eq(businesses.status, status as any));
  }
  if (parts.length === 0) return undefined;
  return and(...parts);
}

function ActionButtons({ id, status, isTop, isRec }: { id: string; status: Row['status']; isTop: boolean; isRec: boolean }) {
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

export default async function AdminBusinessesPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const pg = parsePage(searchParams);
  const search = (searchParams.q || '').trim();
  const status = (searchParams.status || '').trim();

  const where = buildWhere(search, status);
  const offset = (pg.page - 1) * pg.pageSize;

  const rowsDb = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      status: businesses.status,
      isTop: businesses.isTopPartner,
      isRec: businesses.isRecommended,
      createdAt: businesses.createdAt,
    })
    .from(businesses)
    .where(where ?? sql`true`)
    .orderBy(desc(businesses.createdAt))
    .limit(pg.pageSize)
    .offset(offset);

  const rows: Row[] = rowsDb.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status as any,
    isTop: !!r.isTop,
    isRec: !!r.isRec,
    createdAt: new Date(r.createdAt).toLocaleString(),
  }));

  const columns: ColumnDef<Row>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'status', header: 'Status' },
    {
      accessorKey: 'flags',
      header: 'Flags',
      cell: ({ row }) => (
        <div className="text-xs text-fgMuted">
          Top: {row.original.isTop ? 'Yes' : 'No'} · Rec: {row.original.isRec ? 'Yes' : 'No'}
        </div>
      ),
    },
    { accessorKey: 'createdAt', header: 'Created' },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionButtons id={row.original.id} status={row.original.status} isTop={row.original.isTop} isRec={row.original.isRec} />
      ),
    },
  ];

  return (
    <section>
      <h1 className="h2">Businesses</h1>

      <form method="get" className="mt-3 flex flex-wrap gap-2">
        <input
          type="text"
          name="q"
          defaultValue={search}
          placeholder="Search name…"
          className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold"
        />
        <select
          name="status"
          defaultValue={status}
          className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold"
        >
          <option value="">Any status</option>
          <option value="UNDER_REVIEW">UNDER_REVIEW</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="HIDDEN">HIDDEN</option>
        </select>
        <button className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold">Apply</button>
      </form>

      <DataTable columns={columns} data={rows} className="mt-4" />
      <Pager page={pg.page} pageSize={pg.pageSize} pathname="/admin/businesses" searchParams={searchParams as any} />
    </section>
  );
}
```

## Acceptance

- Фильтры и пагинация работают через URL
- Экшены модерации выполняются и обновляют страницу
- Флаги отображаются и переключаются
