# step-3-implementations/06-admin-tables-tanstack/01-users-table-with-filters.md

## Title

Admin — Users table with filters

## Objective

Интерактивная таблица пользователей с фильтрами по email/статусу и пагинацией. Клиентская сортировка по колонкам на текущем наборе.

## Steps

1) DataTable базовый компонент
2) UsersTable обёртка с колонками и фильтрами
3) Серверная страница, которая получает данные и параметры из URL

## Files

### src/components/admin/data-table.tsx

```tsx
'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils/cn';

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  initialSorting?: SortingState;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
  initialSorting = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={cn('overflow-x-auto rounded-lg border border-border', className)}>
      <table className="w-full text-sm">
        <thead className="bg-bgElev">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'px-3 py-2 text-left font-medium select-none',
                    header.column.getCanSort() && 'cursor-pointer'
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="inline-flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: '▲',
                      desc: '▼',
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-border">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td className="px-3 py-6 text-center text-fgMuted" colSpan={columns.length}>
                No records.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
```

### src/app/(admin)/users/page.tsx

```tsx
import { parsePage } from '@/features/admin/server/listing';
import { db } from '@/lib/db';
import { users } from '@/db/schema/user';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Pager } from '@/components/admin/ssr-table'; // Reuse simple pager from SSR variant

type Row = {
  id: string;
  email: string;
  status: 'ACTIVE' | 'BLOCKED';
  isAdmin: boolean;
  createdAt: string;
};

function buildWhere(search?: string, status?: string) {
  const parts: any[] = [];
  if (search) {
    const pattern = `%${search}%`;
    parts.push(ilike(users.email, pattern as any));
  }
  if (status && (status === 'ACTIVE' || status === 'BLOCKED')) {
    parts.push(eq(users.status, status as any));
  }
  if (parts.length === 0) return undefined;
  return and(...parts);
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const pg = parsePage(searchParams);
  const search = (searchParams.q || '').trim();
  const status = (searchParams.status || '').trim();

  const where = buildWhere(search, status);
  const offset = (pg.page - 1) * pg.pageSize;

  const rowsDb = await db
    .select({
      id: users.id,
      email: users.email,
      status: users.status,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(where ?? sql`true`)
    .orderBy(desc(users.createdAt))
    .limit(pg.pageSize)
    .offset(offset);

  const rows: Row[] = rowsDb.map((r) => ({
    id: r.id,
    email: r.email,
    status: r.status as any,
    isAdmin: r.isAdmin,
    createdAt: new Date(r.createdAt).toLocaleString(),
  }));

  const columns: ColumnDef<Row>[] = [
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'status', header: 'Status' },
    {
      accessorKey: 'isAdmin',
      header: 'Admin',
      cell: ({ row }) => (row.original.isAdmin ? 'Yes' : 'No'),
    },
    { accessorKey: 'createdAt', header: 'Created' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <a className="underline hover:text-gold-400" href={`/admin/users/${row.original.id}`}>
          Open
        </a>
      ),
    },
  ];

  return (
    <section>
      <h1 className="h2">Users</h1>

      <form method="get" className="mt-3 flex flex-wrap gap-2">
        <input
          type="text"
          name="q"
          defaultValue={search}
          placeholder="Search email…"
          className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold"
        />
        <select
          name="status"
          defaultValue={status}
          className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold"
        >
          <option value="">Any status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="BLOCKED">BLOCKED</option>
        </select>
        <button className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold">Apply</button>
      </form>

      <DataTable columns={columns} data={rows} className="mt-4" />
      <Pager page={pg.page} pageSize={pg.pageSize} pathname="/admin/users" searchParams={searchParams as any} />
    </section>
  );
}
```

## Acceptance

- Фильтры по email/статусу работают через GET-параметры
- Сортировка по колонкам — клиентская (в рамках страницы)
- Пагинация — серверная через Pager
