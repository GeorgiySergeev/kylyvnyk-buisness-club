'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createMembershipAction,
  softDeleteMembershipAction,
  updateMembershipAction,
} from '@/features/admin/actions/membership-admin.action';

interface MembershipRow {
  endsAt: string | null;
  id: string;
  planCode: string;
  startsAt: string;
  status: string;
  userId: string;
}

export function MembershipsCrud({ rows, disabled = false }: { rows: MembershipRow[]; disabled?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function create(formData: FormData) {
    startTransition(async () => {
      const result = await createMembershipAction({
        endsAt: String(formData.get('endsAt') ?? '').trim() ? new Date(String(formData.get('endsAt'))) : null,
        planCode: String(formData.get('planCode') ?? ''),
        startsAt: new Date(String(formData.get('startsAt') ?? new Date().toISOString())),
        status: String(formData.get('status') ?? ''),
        userId: String(formData.get('userId') ?? ''),
      });
      if (!result.ok) return setError(result.error);
      setError(null);
      router.refresh();
    });
  }

  function update(id: string, formData: FormData) {
    startTransition(async () => {
      const result = await updateMembershipAction({
        endsAt: String(formData.get('endsAt') ?? '').trim() ? new Date(String(formData.get('endsAt'))) : null,
        membershipId: id,
        planCode: String(formData.get('planCode') ?? ''),
        startsAt: new Date(String(formData.get('startsAt') ?? new Date().toISOString())),
        status: String(formData.get('status') ?? ''),
      });
      if (!result.ok) return setError(result.error);
      setError(null);
      router.refresh();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await softDeleteMembershipAction({ membershipId: id });
      if (!result.ok) return setError(result.error);
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <form action={create} className="grid gap-2 rounded-md border border-border/80 bg-card/70 p-3 md:grid-cols-[1fr_140px_140px_140px_140px_auto]">
        <Input name="userId" placeholder="User UUID" required />
        <Input name="planCode" placeholder="Plan code" required />
        <Input name="status" placeholder="Status" required />
        <Input name="startsAt" type="datetime-local" required />
        <Input name="endsAt" type="datetime-local" />
        <Button disabled={pending || disabled} type="submit">{pending ? <Loader2 className="size-4 animate-spin" /> : 'Create'}</Button>
      </form>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {rows.map((row) => (
        <form key={row.id} action={(fd) => update(row.id, fd)} className="grid gap-2 rounded-md border border-border/70 bg-card/50 p-3 md:grid-cols-[1fr_140px_140px_140px_140px_auto_auto]">
          <Input defaultValue={row.userId} disabled />
          <Input defaultValue={row.planCode} name="planCode" required />
          <Input defaultValue={row.status} name="status" required />
          <Input defaultValue={row.startsAt} name="startsAt" type="datetime-local" required />
          <Input defaultValue={row.endsAt ?? ''} name="endsAt" type="datetime-local" />
          <Button disabled={pending || disabled} type="submit" variant="outline">Save</Button>
          <Button disabled={pending || disabled} type="button" variant="destructive" onClick={() => remove(row.id)}>Disable</Button>
        </form>
      ))}
    </div>
  );
}
