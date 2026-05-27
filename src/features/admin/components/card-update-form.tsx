'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateCardAction } from '@/features/admin/actions/card-admin.action';

interface CardUpdateFormProps {
  cardId: string;
  currentExpiresAt: string | null;
  currentMemberType: 'FREE' | 'BUSINESS' | 'VIP';
  currentStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

export function CardUpdateForm({
  cardId,
  currentExpiresAt,
  currentMemberType,
  currentStatus,
}: CardUpdateFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    const expiresRaw = String(formData.get('expiresAt') ?? '').trim();
    const memberType = String(formData.get('memberType') ?? currentMemberType);
    const status = String(formData.get('status') ?? currentStatus);

    startTransition(async () => {
      const result = await updateCardAction({
        cardId,
        expiresAt: expiresRaw ? new Date(expiresRaw) : null,
        memberType,
        status,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  return (
    <form action={submit} className="grid gap-3 rounded-md border border-border/80 bg-card/70 p-3 md:grid-cols-4">
      <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" defaultValue={currentMemberType} name="memberType">
        <option value="FREE">FREE</option>
        <option value="BUSINESS">BUSINESS</option>
        <option value="VIP">VIP</option>
      </select>
      <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" defaultValue={currentStatus} name="status">
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
        <option value="EXPIRED">EXPIRED</option>
      </select>
      <Input defaultValue={currentExpiresAt ?? ''} name="expiresAt" type="datetime-local" />
      <Button className="h-10" disabled={pending} type="submit">
        {pending ? <Loader2 className="size-4 animate-spin" /> : 'Update card'}
      </Button>
      {error ? <p className="text-sm text-red-400 md:col-span-4">{error}</p> : null}
    </form>
  );
}
