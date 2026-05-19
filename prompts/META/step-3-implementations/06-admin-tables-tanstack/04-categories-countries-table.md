# step-3-implementations/06-admin-tables-tanstack/04-categories-countries-table.md

## Title

Admin — Categories & Countries (mini-CRUD)

## Objective

Простые таблицы со списком и формами добавления/редактирования. Обработка уникальностей (slug/iso2), безопасные паттерны.

## Files

### src/features/admin/server/dicts-actions.ts

```ts
'use server';

import 'server-only';
import { db } from '@/lib/db';
import { categories } from '@/db/schema/catalog';
import { countries } from '@/db/schema/geo';
import { eq } from 'drizzle-orm';

export async function addCategory(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  if (!name || !/^[a-z0-9-]{2,160}$/.test(slug)) {
    throw new Error('VALIDATION_ERROR');
  }
  await db.insert(categories).values({ name, slug }).onConflictDoNothing();
}

export async function updateCategory(formData: FormData) {
  const id = Number(formData.get('id') || 0);
  const name = String(formData.get('name') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  if (!id || !name || !/^[a-z0-9-]{2,160}$/.test(slug)) throw new Error('VALIDATION_ERROR');
  await db.update(categories).set({ name, slug }).where(eq(categories.id, id));
}

export async function addCountry(formData: FormData) {
  const iso2 = String(formData.get('iso2') || '').trim().toUpperCase();
  const name = String(formData.get('name') || '').trim();
  if (!/^[A-Z]{2}$/.test(iso2) || !name) throw new Error('VALIDATION_ERROR');
  await db.insert(countries).values({ iso2, name }).onConflictDoNothing();
}

export async function updateCountry(formData: FormData) {
  const id = Number(formData.get('id') || 0);
  const iso2 = String(formData.get('iso2') || '').trim().toUpperCase();
  const name = String(formData.get('name') || '').trim();
  if (!id || !/^[A-Z]{2}$/.test(iso2) || !name) throw new Error('VALIDATION_ERROR');
  await db.update(countries).set({ iso2, name }).where(eq(countries.id, id));
}
```

### src/app/(admin)/categories/page.tsx

```tsx
import { db } from '@/lib/db';
import { categories } from '@/db/schema/catalog';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { addCategory, updateCategory } from '@/features/admin/server/dicts-actions';

type Row = { id: number; name: string; slug: string; createdAt: string };

export default async function AdminCategoriesPage() {
  const rowsDb = await db.select().from(categories).orderBy(categories.name);
  const rows: Row[] = rowsDb.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    createdAt: new Date(r.createdAt).toLocaleString(),
  }));

  const columns: ColumnDef<Row>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'slug', header: 'Slug' },
    { accessorKey: 'createdAt', header: 'Created' },
    {
      id: 'edit',
      header: 'Edit',
      cell: ({ row }) => (
        <form action={updateCategory} className="flex flex-wrap gap-2 text-xs">
          <input type="hidden" name="id" value={row.original.id} />
          <input name="name" defaultValue={row.original.name} className="min-h-8 rounded-md border border-border bg-card px-2 py-1 focus-gold" />
          <input name="slug" defaultValue={row.original.slug} className="min-h-8 rounded-md border border-border bg-card px-2 py-1 focus-gold" />
          <button className="px-3 py-1 rounded-md border border-border hover:bg-bgElev">Save</button>
        </form>
      ),
    },
  ];

  return (
    <section>
      <h1 className="h2">Categories</h1>

      <form action={addCategory} className="mt-3 flex flex-wrap gap-2">
        <input name="name" placeholder="Name" className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold" required />
        <input name="slug" placeholder="slug-like-this" className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold" required />
        <button className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold">Add</button>
      </form>

      <DataTable columns={columns} data={rows} className="mt-4" />
    </section>
  );
}
```

### src/app/(admin)/countries/page.tsx

```tsx
import { db } from '@/lib/db';
import { countries } from '@/db/schema/geo';
import { DataTable } from '@/components/admin/data-table';
import type { ColumnDef } from '@tanstack/react-table';
import { addCountry, updateCountry } from '@/features/admin/server/dicts-actions';

type Row = { id: number; iso2: string; name: string; createdAt: string };

export default async function AdminCountriesPage() {
  const rowsDb = await db.select().from(countries).orderBy(countries.name);
  const rows: Row[] = rowsDb.map((r) => ({
    id: r.id,
    iso2: r.iso2,
    name: r.name,
    createdAt: new Date(r.createdAt).toLocaleString(),
  }));

  const columns: ColumnDef<Row>[] = [
    { accessorKey: 'iso2', header: 'ISO2' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'createdAt', header: 'Created' },
    {
      id: 'edit',
      header: 'Edit',
      cell: ({ row }) => (
        <form action={updateCountry} className="flex flex-wrap gap-2 text-xs">
          <input type="hidden" name="id" value={row.original.id} />
          <input name="iso2" defaultValue={row.original.iso2} className="min-h-8 rounded-md border border-border bg-card px-2 py-1 focus-gold" />
          <input name="name" defaultValue={row.original.name} className="min-h-8 rounded-md border border-border bg-card px-2 py-1 focus-gold" />
          <button className="px-3 py-1 rounded-md border border-border hover:bg-bgElev">Save</button>
        </form>
      ),
    },
  ];

  return (
    <section>
      <h1 className="h2">Countries</h1>

      <form action={addCountry} className="mt-3 flex flex-wrap gap-2">
        <input name="iso2" placeholder="US" maxLength={2} className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold" required />
        <input name="name" placeholder="United States" className="min-h-10 rounded-md border border-border bg-card px-3 py-2 focus-gold" required />
        <button className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold">Add</button>
      </form>

      <DataTable columns={columns} data={rows} className="mt-4" />
    </section>
  );
}
```

## Acceptance

- Add/Update работает; уникальности (slug/iso2) соблюдаются
- Таблицы показывают добавленные записи мгновенно (серверный ререндер)
