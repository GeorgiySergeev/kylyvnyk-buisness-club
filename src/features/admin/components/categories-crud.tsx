'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from '@/features/admin/actions/reference-admin.action';

interface CategoryRow {
  icon: string | null;
  id: number;
  linkedBusinesses: number;
  name: string;
  parentId: number | null;
  slug: string;
}

interface CategoriesCrudProps {
  labels: {
    create: string;
    delete: string;
    icon: string;
    name: string;
    parentId: string;
    save: string;
    slug: string;
  };
  rows: CategoryRow[];
}

export function CategoriesCrud({ rows, labels }: CategoriesCrudProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function parseParentId(value: unknown) {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const num = Number(raw);
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  function create(formData: FormData) {
    startTransition(async () => {
      const result = await createCategoryAction({
        icon: String(formData.get('icon') ?? '').trim() || null,
        name: String(formData.get('name') ?? ''),
        parentId: parseParentId(formData.get('parentId')),
        slug: String(formData.get('slug') ?? ''),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  function update(categoryId: number, formData: FormData) {
    startTransition(async () => {
      const result = await updateCategoryAction({
        categoryId,
        icon: String(formData.get('icon') ?? '').trim() || null,
        name: String(formData.get('name') ?? ''),
        parentId: parseParentId(formData.get('parentId')),
        slug: String(formData.get('slug') ?? ''),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  function remove(categoryId: number) {
    startTransition(async () => {
      const result = await deleteCategoryAction({ categoryId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <form action={create} className="grid gap-2 rounded-md border border-border/80 bg-card/70 p-3 md:grid-cols-[1fr_1fr_120px_120px_auto]">
        <Input name="name" placeholder={labels.name} required />
        <Input name="slug" placeholder={labels.slug} required />
        <Input name="parentId" placeholder={labels.parentId} />
        <Input name="icon" placeholder={labels.icon} />
        <Button disabled={pending} type="submit" className="h-10">{pending ? <Loader2 className="size-4 animate-spin" /> : labels.create}</Button>
      </form>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {rows.map((row) => (
        <form
          key={row.id}
          action={(formData) => update(row.id, formData)}
          className="grid gap-2 rounded-md border border-border/70 bg-card/50 p-3 md:grid-cols-[1fr_1fr_120px_120px_auto_auto]"
        >
          <Input defaultValue={row.name} name="name" required />
          <Input defaultValue={row.slug} name="slug" required />
          <Input defaultValue={row.parentId ?? ''} name="parentId" placeholder={labels.parentId} />
          <Input defaultValue={row.icon ?? ''} name="icon" />
          <Button disabled={pending} type="submit" variant="outline">{labels.save}</Button>
          <Button
            disabled={pending || row.linkedBusinesses > 0}
            onClick={() => remove(row.id)}
            type="button"
            variant="destructive"
          >
            {labels.delete}
          </Button>
        </form>
      ))}
    </div>
  );
}
