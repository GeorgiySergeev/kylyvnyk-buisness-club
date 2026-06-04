'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createStripeLinkAction,
  deleteStripeLinkAction,
  updateStripeLinkAction,
} from '@/features/admin/actions/stripe-admin.action';

interface StripeLinkRow {
  code: string;
  id: string;
  paymentLinkUrl: string;
  status: string;
  title: string;
}

interface StripeLinksCrudProps {
  labels: {
    code: string;
    create: string;
    disable: string;
    paymentLinkUrl: string;
    save: string;
    title: string;
  };
  rows: StripeLinkRow[];
}

export function StripeLinksCrud({
  rows,
  disabled = false,
  labels,
}: StripeLinksCrudProps & { disabled?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function create(formData: FormData) {
    startTransition(async () => {
      const result = await createStripeLinkAction({
        code: String(formData.get('code') ?? ''),
        paymentLinkUrl: String(formData.get('paymentLinkUrl') ?? ''),
        title: String(formData.get('title') ?? ''),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  function update(stripeLinkId: string, formData: FormData) {
    startTransition(async () => {
      const result = await updateStripeLinkAction({
        code: String(formData.get('code') ?? ''),
        paymentLinkUrl: String(formData.get('paymentLinkUrl') ?? ''),
        stripeLinkId,
        title: String(formData.get('title') ?? ''),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  function remove(stripeLinkId: string) {
    startTransition(async () => {
      const result = await deleteStripeLinkAction({ stripeLinkId });
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
      <form action={create} className="grid gap-2 rounded-md border border-border/80 bg-card/70 p-3 md:grid-cols-[1fr_160px_1fr_auto]">
        <Input name="title" placeholder={labels.title} required />
        <Input name="code" placeholder={labels.code} required />
        <Input name="paymentLinkUrl" placeholder={labels.paymentLinkUrl} required />
        <Button disabled={pending || disabled} type="submit" className="h-10">{pending ? <Loader2 className="size-4 animate-spin" /> : labels.create}</Button>
      </form>
      {error ? <p className="text-sm text-ds-error">{error}</p> : null}

      {rows.map((row) => (
        <form
          key={row.id}
          action={(formData) => update(row.id, formData)}
          className="grid gap-2 rounded-md border border-border/70 bg-card/50 p-3 md:grid-cols-[1fr_160px_1fr_100px_auto_auto]"
        >
          <Input defaultValue={row.title} name="title" required />
          <Input defaultValue={row.code} name="code" required />
          <Input defaultValue={row.paymentLinkUrl} name="paymentLinkUrl" required />
          <div className="flex items-center text-xs text-muted-foreground">{row.status}</div>
          <Button disabled={pending || disabled} type="submit" variant="outline">{labels.save}</Button>
          <Button disabled={pending || disabled} onClick={() => remove(row.id)} type="button" variant="destructive">{labels.disable}</Button>
        </form>
      ))}
    </div>
  );
}
