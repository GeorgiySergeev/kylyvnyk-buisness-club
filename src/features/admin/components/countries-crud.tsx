'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createCountryAction,
  deleteCountryAction,
  updateCountryAction,
} from '@/features/admin/actions/reference-admin.action';

interface CountryRow {
  flagEmoji: string | null;
  id: number;
  iso2: string;
  linkedBusinesses: number;
  name: string;
}

interface CountriesCrudProps {
  labels: {
    create: string;
    delete: string;
    flag: string;
    iso2: string;
    name: string;
    save: string;
  };
  rows: CountryRow[];
}

export function CountriesCrud({ rows, labels }: CountriesCrudProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function create(formData: FormData) {
    const name = String(formData.get('name') ?? '');
    const iso2 = String(formData.get('iso2') ?? '');
    const flagEmoji = String(formData.get('flagEmoji') ?? '').trim();

    startTransition(async () => {
      const result = await createCountryAction({
        flagEmoji: flagEmoji.length > 0 ? flagEmoji : null,
        iso2,
        name,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  function update(countryId: number, formData: FormData) {
    const name = String(formData.get('name') ?? '');
    const iso2 = String(formData.get('iso2') ?? '');
    const flagEmoji = String(formData.get('flagEmoji') ?? '').trim();

    startTransition(async () => {
      const result = await updateCountryAction({
        countryId,
        flagEmoji: flagEmoji.length > 0 ? flagEmoji : null,
        iso2,
        name,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  function remove(countryId: number) {
    startTransition(async () => {
      const result = await deleteCountryAction({ countryId });
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
      <form action={create} className="grid gap-2 rounded-md border border-border/80 bg-card/70 p-3 md:grid-cols-[1fr_120px_120px_auto]">
        <Input name="name" placeholder={labels.name} required />
        <Input maxLength={2} minLength={2} name="iso2" placeholder={labels.iso2} required />
        <Input name="flagEmoji" placeholder={labels.flag} />
        <Button disabled={pending} type="submit" className="h-10">
          {pending ? <Loader2 className="size-4 animate-spin" /> : labels.create}
        </Button>
      </form>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {rows.map((row) => (
        <form
          key={row.id}
          action={(formData) => update(row.id, formData)}
          className="grid gap-2 rounded-md border border-border/70 bg-card/50 p-3 md:grid-cols-[1fr_120px_120px_auto_auto]"
        >
          <Input defaultValue={row.name} name="name" required />
          <Input defaultValue={row.iso2} maxLength={2} minLength={2} name="iso2" required />
          <Input defaultValue={row.flagEmoji ?? ''} name="flagEmoji" />
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
