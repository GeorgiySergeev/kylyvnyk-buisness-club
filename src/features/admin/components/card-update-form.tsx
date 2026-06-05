'use client';

import { Loader2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateCardAction } from '@/features/admin/actions/card-admin.action';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';

interface CardUpdateFormProps {
  cardId: string;
  currentDiscountLabel: string | null;
  currentExpiresAt: string | null;
  currentMemberType: 'FREE' | 'BUSINESS' | 'VIP';
  currentStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'ARCHIVED';
}

export function CardUpdateForm({
  cardId,
  currentDiscountLabel,
  currentExpiresAt,
  currentMemberType,
  currentStatus,
}: CardUpdateFormProps) {
  const { pending, refresh, run } = useAdminMutation();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(formData: FormData) {
    setSaved(false);
    const discountLabel = String(formData.get('discountLabel') ?? '').trim() || null;
    const expiresRaw = String(formData.get('expiresAt') ?? '').trim();
    const memberType = String(formData.get('memberType') ?? currentMemberType);
    const status = String(formData.get('status') ?? currentStatus);

    const result = await run(() =>
      updateCardAction({
        cardId,
        discountLabel,
        expiresAt: expiresRaw ? new Date(expiresRaw) : null,
        memberType,
        status,
      }),
    );

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(null);
    setSaved(true);
    refresh();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(new FormData(event.currentTarget));
  }

  return (
    <form
      className="grid gap-3 rounded-ds-radius-lg border border-ds-border bg-ds-surface/80 p-4 shadow-sm md:grid-cols-4"
      onSubmit={onSubmit}
    >
      <select
        className="h-10 rounded-ds-radius-md border border-ds-border bg-ds-bg px-3 text-sm text-ds-text shadow-sm outline-none transition-colors focus-visible:border-ds-ring focus-visible:ring-2 focus-visible:ring-ds-ring/25"
        defaultValue={currentMemberType}
        name="memberType"
      >
        <option value="FREE">FREE</option>
        <option value="BUSINESS">BUSINESS</option>
        <option value="VIP">VIP</option>
      </select>
      <select
        className="h-10 rounded-ds-radius-md border border-ds-border bg-ds-bg px-3 text-sm text-ds-text shadow-sm outline-none transition-colors focus-visible:border-ds-ring focus-visible:ring-2 focus-visible:ring-ds-ring/25"
        defaultValue={currentStatus}
        name="status"
      >
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
        <option value="EXPIRED">EXPIRED</option>
        <option value="ARCHIVED">ARCHIVED</option>
      </select>
      <Input defaultValue={currentExpiresAt ?? ''} name="expiresAt" type="datetime-local" />
      <Input defaultValue={currentDiscountLabel ?? ''} name="discountLabel" placeholder="Discount label" />
      <Button className="h-10" disabled={pending} type="submit">
        {pending ? <Loader2 className="size-4 animate-spin" /> : 'Update card'}
      </Button>
      {saved ? (
        <p className="text-sm text-ds-success md:col-span-4" role="status">
          Card updated successfully.
        </p>
      ) : null}
      {error ? <p className="text-sm text-ds-error md:col-span-4">{error}</p> : null}
    </form>
  );
}
