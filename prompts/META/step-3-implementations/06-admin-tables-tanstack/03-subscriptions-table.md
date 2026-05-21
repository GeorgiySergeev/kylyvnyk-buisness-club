# step-3-implementations/06-admin-tables-tanstack/03-subscriptions-table.md

## Title

Admin — Subscriptions table

## Objective

Просмотр подписок Stripe с фильтрами по статусу и поиском по customer/sub id. Быстрые ссылки в Stripe Dashboard.

## Files

### src/app/(admin)/subscriptions/page.tsx

```tsx
import type { ColumnDef } from '@tanstack/react-table';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';

import { DataTable } from '@/components/admin/data-table';
import { Pager } from '@/components/admin/ssr-table';
import { subscriptions } from '@/db/schema/stripe';
import { parsePage } from '@/features/admin/server/listing';
import { db } from '@/lib/db';

type Row = {
  id: string;
  userId: string;
  customer: string;
  subId: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
};

function buildWhere(search?: string, status?: string) {
  const parts: any[] = [];
  if (search) {
    const pattern = `%${search}%`;
    parts.push(
      or(
        ilike(subscriptions.stripeCustomerId, pattern as any),
        ilike(subscriptions.stripeSubscriptionId, pattern as any),
      ),
    );
  }
  if (status) {
    const pattern = `%${status}%`;
    parts.push(ilike(subscriptions.statusRaw, pattern as any));
  }
  if (parts.length === 0) return undefined;
  return and(...parts);
}

function stripeCustomerUrl(id: string) {
  return `https://dashboard.stripe.com/customers/${id}`;
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const pg = parsePage(searchParams);
  const search = (searchParams.q || '').trim();
  const status = (searchParams.status || '').trim();

  const where = buildWhere(search, status);
  const offset = (pg.page - 1) * pg.pageSize;

  const rowsDb = await db
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
    .where(where ?? sql`true`)
    .orderBy(desc(subscriptions.updatedAt))
    .limit(pg.pageSize)
    .offset(offset);

  const rows: Row[] = rowsDb.map((r) => ({
    id: r.id,
    userId: r.userId,
    customer: r.customer,
    subId: r.subId,
    status: r.status,
    currentPeriodEnd: r.currentPeriodEnd ? new Date(r.currentPeriodEnd).toLocaleString() : '—',
    cancelAtPeriodEnd: !!r.cancelAtPeriodEnd,
  }));

  const columns: ColumnDef<Row>[] = [
    { accessorKey: 'status', header: 'Status' },
    {
      accessorKey: 'customer',
      header: 'Customer',
      cell: ({ row }) => (
        <a
          className="underline hover:text-gold-400"
          href={stripeCustomerUrl(row.original.customer)}
          target="_blank"
          rel="noreferrer"
        >
          {row.original.customer}
        </a>
      ),
    },
    { accessorKey: 'subId', header: 'Subscription' },
    { accessorKey: 'currentPeriodEnd', header: 'Period End' },
    {
      accessorKey: 'cancelAtPeriodEnd',
      header: 'Cancel At Period End',
      cell: ({ row }) => (row.original.cancelAtPeriodEnd ? 'Yes' : 'No'),
    },
  ];

  return (
    <section>
      <h1 className="h2">Subscriptions</h1>

      <form method="get" className="mt-3 flex flex-wrap gap-2">
        <input
          type="text"
          name="q"
          defaultValue={search}
          placeholder="Search customer/sub id…"
          className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold"
        />
        <input
          type="text"
          name="status"
          defaultValue={status}
          placeholder="Filter status contains (e.g. active)"
          className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold"
        />
        <button className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold">
          Apply
        </button>
      </form>

      <DataTable columns={columns} data={rows} className="mt-4" />
      <Pager
        page={pg.page}
        pageSize={pg.pageSize}
        pathname="/admin/subscriptions"
        searchParams={searchParams as any}
      />
    </section>
  );
}
```

## Acceptance

- Фильтры по статусу/поиску работают
- Быстрая ссылка открывает клиента в Stripe Dashboard
- Пагинация через URL
