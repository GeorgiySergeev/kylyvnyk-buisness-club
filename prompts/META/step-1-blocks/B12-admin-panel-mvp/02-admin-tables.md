# 02-admin-tables.md

## Title

Admin Tables — Users, Businesses, Categories, Countries, Subscriptions (SSR minimal)

## Objective

Render basic server-side tables for core entities with essential columns and simple pagination. No client data grid yet (TanStack planned in Step 3).

## Steps

1) Create reusable SSR Table component.
2) Implement list queries for each entity.
3) Render tables with page/pageSize from query params.

## Files to add/modify

- src/components/admin/ssr-table.tsx
- src/features/admin/server/listing.ts
- Update admin pages to render tables

### src/components/admin/ssr-table.tsx

```tsx
import Link from 'next/link';

export function SsrTable({
  columns,
  rows,
  emptyText = 'No records.',
}: {
  columns: { key: string; header: string; width?: string }[];
  rows: Array<Record<string, React.ReactNode>>;
  emptyText?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-border bg-card p-6 text-sm text-fgMuted">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-bgElev">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left font-medium px-3 py-2" style={{ width: c.width }}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2 align-top">
                  {r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pager({
  totalHint,
  page,
  pageSize,
  pathname,
  searchParams,
}: {
  totalHint?: number;
  page: number;
  pageSize: number;
  pathname: string;
  searchParams: Record<string, string | undefined>;
}) {
  function link(toPage: number) {
    const sp = new URLSearchParams(searchParams as any);
    sp.set('page', String(toPage));
    sp.set('pageSize', String(pageSize));
    return `${pathname}?${sp.toString()}`;
    }
  return (
    <div className="mt-3 flex items-center gap-3">
      <a className="px-3 py-2 border border-border rounded-md hover:bg-bgElev" href={link(Math.max(1, page - 1))}>
        Prev
      </a>
      <span className="text-sm text-fgMuted">Page {page}{totalHint ? ` of ~${Math.ceil(totalHint / pageSize)}` : ''}</span>
      <a className="px-3 py-2 border border-border rounded-md hover:bg-bgElev" href={link(page + 1)}>
        Next
      </a>
    </div>
  );
}
```

### src/features/admin/server/listing.ts

```ts
import 'server-only';
import { db } from '@/lib/db';
import { users } from '@/db/schema/user';
import { businesses, categories } from '@/db/schema/catalog';
import { countries, cities } from '@/db/schema/geo';
import { subscriptions } from '@/db/schema/stripe';
import { desc, eq, sql } from 'drizzle-orm';

export type PageArgs = { page: number; pageSize: number };

export function parsePage(args: Record<string, string | undefined>): PageArgs {
  const page = Math.max(1, Number(args.page || '1'));
  const pageSize = Math.min(50, Math.max(5, Number(args.pageSize || '20')));
  return { page, pageSize };
}

export async function listUsers({ page, pageSize }: PageArgs) {
  const offset = (page - 1) * pageSize;
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      status: users.status,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);
  return { rows, totalHint: undefined as number | undefined };
}

export async function listBusinesses({ page, pageSize }: PageArgs) {
  const offset = (page - 1) * pageSize;
  const rows = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      status: businesses.status,
      isTop: businesses.isTopPartner,
      isRec: businesses.isRecommended,
      createdAt: businesses.createdAt,
    })
    .from(businesses)
    .orderBy(desc(businesses.createdAt))
    .limit(pageSize)
    .offset(offset);
  return { rows, totalHint: undefined };
}

export async function listCategories({ page, pageSize }: PageArgs) {
  const offset = (page - 1) * pageSize;
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      createdAt: categories.createdAt,
    })
    .from(categories)
    .orderBy(categories.name)
    .limit(pageSize)
    .offset(offset);
  return { rows, totalHint: undefined };
}

export async function listCountries({ page, pageSize }: PageArgs) {
  const offset = (page - 1) * pageSize;
  const rows = await db
    .select({
      id: countries.id,
      iso2: countries.iso2,
      name: countries.name,
      createdAt: countries.createdAt,
    })
    .from(countries)
    .orderBy(countries.name)
    .limit(pageSize)
    .offset(offset);
  return { rows, totalHint: undefined };
}

export async function listSubscriptions({ page, pageSize }: PageArgs) {
  const offset = (page - 1) * pageSize;
  const rows = await db
    .select({
      id: subscriptions.id,
      userId: subscriptions.userId,
      customer: subscriptions.stripeCustomerId,
      subId: subscriptions.stripeSubscriptionId,
      status: subscriptions.statusRaw,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
    })
    .from(subscriptions)
    .orderBy(desc(subscriptions.updatedAt))
    .limit(pageSize)
    .offset(offset);
  return { rows, totalHint: undefined };
}
```

### Wire tables in pages (example for Users; repeat pattern)

```tsx
// src/app/(admin)/users/page.tsx
import { parsePage, listUsers } from '@/features/admin/server/listing';
import { SsrTable, Pager } from '@/components/admin/ssr-table';

export default async function AdminUsersPage({ searchParams }: { searchParams: Record<string, string> }) {
  const pg = parsePage(searchParams);
  const { rows, totalHint } = await listUsers(pg);

  return (
    <section>
      <h1 className="h2">Users</h1>
      <SsrTable
        columns={[
          { key: 'email', header: 'Email' },
          { key: 'status', header: 'Status', width: '120px' },
          { key: 'isAdmin', header: 'Admin', width: '80px' },
          { key: 'createdAt', header: 'Created', width: '180px' },
          { key: 'actions', header: '', width: '120px' },
        ]}
        rows={rows.map((r) => ({
          email: r.email,
          status: r.status,
          isAdmin: r.isAdmin ? 'Yes' : 'No',
          createdAt: new Date(r.createdAt).toLocaleString(),
          actions: <a className="underline hover:text-gold-400" href={`/admin/users/${r.id}`}>Open</a>,
        }))}
      />
      <Pager totalHint={totalHint} page={pg.page} pageSize={pg.pageSize} pathname="/admin/users" searchParams={searchParams} />
    </section>
  );
}
```

Repeat similar wiring for:

- src/app/(admin)/businesses/page.tsx using listBusinesses
- src/app/(admin)/categories/page.tsx using listCategories
- src/app/(admin)/countries/page.tsx using listCountries
- src/app/(admin)/subscriptions/page.tsx using listSubscriptions

## Acceptance

- Admin lists render tables with basic pagination.
- No client data grid dependency yet; SSR only.
- Navigation between sections works.
