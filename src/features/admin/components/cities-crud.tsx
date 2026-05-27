'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createCityAction,
  deleteCityAction,
  updateCityAction,
} from '@/features/admin/actions/reference-admin.action';

interface CityRow {
  countryId: number;
  countryIso2: string;
  countryName: string;
  id: number;
  linkedBusinesses: number;
  name: string;
}

interface CitiesCrudProps {
  rows: CityRow[];
}

export function CitiesCrud({ rows }: CitiesCrudProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function create(formData: FormData) {
    startTransition(async () => {
      const result = await createCityAction({
        countryId: Number(formData.get('countryId')),
        name: String(formData.get('name') ?? ''),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  function update(cityId: number, formData: FormData) {
    startTransition(async () => {
      const result = await updateCityAction({
        cityId,
        countryId: Number(formData.get('countryId')),
        name: String(formData.get('name') ?? ''),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  function remove(cityId: number) {
    startTransition(async () => {
      const result = await deleteCityAction({ cityId });
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
      <form action={create} className="grid gap-2 rounded-md border border-border/80 bg-card/70 p-3 md:grid-cols-[1fr_120px_auto]">
        <Input name="name" placeholder="City name" required />
        <Input min={1} name="countryId" placeholder="Country ID" type="number" required />
        <Button disabled={pending} type="submit" className="h-10">{pending ? <Loader2 className="size-4 animate-spin" /> : 'Create'}</Button>
      </form>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {rows.map((row) => (
        <form
          key={row.id}
          action={(formData) => update(row.id, formData)}
          className="grid gap-2 rounded-md border border-border/70 bg-card/50 p-3 md:grid-cols-[1fr_120px_1fr_auto_auto]"
        >
          <Input defaultValue={row.name} name="name" required />
          <Input defaultValue={row.countryId} min={1} name="countryId" type="number" required />
          <div className="flex items-center text-xs text-muted-foreground">{row.countryName} ({row.countryIso2})</div>
          <Button disabled={pending} type="submit" variant="outline">Save</Button>
          <Button
            disabled={pending || row.linkedBusinesses > 0}
            onClick={() => remove(row.id)}
            type="button"
            variant="destructive"
          >
            Delete
          </Button>
        </form>
      ))}
    </div>
  );
}
