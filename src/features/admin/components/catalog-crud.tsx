'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createCatalogItemAction,
  softDeleteCatalogItemAction,
  updateCatalogItemAction,
} from '@/features/admin/actions/catalog-admin.action';

interface CatalogRow {
  businessId: string;
  id: string;
  slug: string;
  status: string;
  summary: string | null;
  title: string;
}

interface CatalogCrudLabels {
  archive: string;
  businessId: string;
  create: string;
  save: string;
  slug: string;
  status: string;
  summary: string;
  title: string;
}

export function CatalogCrud({
  rows,
  disabled = false,
  labels,
}: {
  disabled?: boolean;
  labels: CatalogCrudLabels;
  rows: CatalogRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function create(formData: FormData) {
    startTransition(async () => {
      const result = await createCatalogItemAction({
        businessId: String(formData.get('businessId') ?? ''),
        slug: String(formData.get('slug') ?? ''),
        status: String(formData.get('status') ?? ''),
        summary: String(formData.get('summary') ?? '').trim() || null,
        title: String(formData.get('title') ?? ''),
      });
      if (!result.ok) return setError(result.error);
      setError(null);
      router.refresh();
    });
  }

  function update(id: string, formData: FormData) {
    startTransition(async () => {
      const result = await updateCatalogItemAction({
        catalogItemId: id,
        slug: String(formData.get('slug') ?? ''),
        status: String(formData.get('status') ?? ''),
        summary: String(formData.get('summary') ?? '').trim() || null,
        title: String(formData.get('title') ?? ''),
      });
      if (!result.ok) return setError(result.error);
      setError(null);
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await softDeleteCatalogItemAction({ catalogItemId: id });
      if (!result.ok) return setError(result.error);
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <form action={create} className="grid gap-2 rounded-md border border-border/80 bg-card/70 p-3 md:grid-cols-3 lg:grid-cols-[1fr_1fr_120px_1fr_120px_auto]">
        <Input name="businessId" placeholder={labels.businessId} required />
        <Input name="title" placeholder={labels.title} required />
        <Input name="slug" placeholder={labels.slug} required />
        <Input name="summary" placeholder={labels.summary} />
        <Input name="status" placeholder={labels.status} required />
        <Button disabled={pending || disabled} type="submit">{pending ? <Loader2 className="size-4 animate-spin" /> : labels.create}</Button>
      </form>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {rows.map((row) => (
        <form key={row.id} action={(fd) => update(row.id, fd)} className="grid gap-2 rounded-md border border-border/70 bg-card/50 p-3 md:grid-cols-3 lg:grid-cols-[1fr_1fr_120px_1fr_120px_auto_auto]">
          <Input defaultValue={row.businessId} disabled />
          <Input defaultValue={row.title} name="title" required />
          <Input defaultValue={row.slug} name="slug" required />
          <Input defaultValue={row.summary ?? ''} name="summary" />
          <Input defaultValue={row.status} name="status" required />
          <Button disabled={pending || disabled} type="submit" variant="outline">{labels.save}</Button>
          <Button disabled={pending || disabled} type="button" variant="destructive" onClick={() => remove(row.id)}>{labels.archive}</Button>
        </form>
      ))}
    </div>
  );
}
