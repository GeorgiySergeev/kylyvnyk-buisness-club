'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  restoreUserAction,
  softDeleteUserAction,
  updateUserDetailsAction,
  updateUserProfileAction,
} from '@/features/admin/actions/user-admin.action';

interface UserCrudFormProps {
  current: {
    avatarUrl: string | null;
    bio: string | null;
    cityId: number | null;
    countryId: number | null;
    deletedAt: string | null;
    displayName: string | null;
    email: string | null;
    phone: string;
    supabaseUserId: string | null;
    userId: string;
  };
}

export function UserCrudForm({ current }: UserCrudFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function saveUser(formData: FormData) {
    startTransition(async () => {
      const result = await updateUserDetailsAction({
        displayName: String(formData.get('displayName') ?? '').trim() || null,
        email: String(formData.get('email') ?? '').trim() || null,
        phone: String(formData.get('phone') ?? '').trim(),
        supabaseUserId: String(formData.get('supabaseUserId') ?? '').trim() || null,
        userId: current.userId,
      });
      if (!result.ok) return setError(result.error);
      setError(null);
      router.refresh();
    });
  }

  function saveProfile(formData: FormData) {
    const cityRaw = String(formData.get('cityId') ?? '').trim();
    const countryRaw = String(formData.get('countryId') ?? '').trim();

    startTransition(async () => {
      const result = await updateUserProfileAction({
        avatarUrl: String(formData.get('avatarUrl') ?? '').trim() || null,
        bio: String(formData.get('bio') ?? '').trim() || null,
        cityId: cityRaw ? Number(cityRaw) : null,
        countryId: countryRaw ? Number(countryRaw) : null,
        userId: current.userId,
      });
      if (!result.ok) return setError(result.error);
      setError(null);
      router.refresh();
    });
  }

  function toggleDelete() {
    startTransition(async () => {
      const result = current.deletedAt
        ? await restoreUserAction({ userId: current.userId })
        : await softDeleteUserAction({ userId: current.userId });
      if (!result.ok) return setError(result.error);
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <form action={saveUser} className="grid gap-3 rounded-md border border-border/80 bg-card/70 p-3 md:grid-cols-2">
        <Input defaultValue={current.displayName ?? ''} name="displayName" placeholder="Display name" />
        <Input defaultValue={current.phone} name="phone" placeholder="Phone" required />
        <Input defaultValue={current.email ?? ''} name="email" placeholder="Email" type="email" />
        <Input defaultValue={current.supabaseUserId ?? ''} name="supabaseUserId" placeholder="Supabase user id" />
        <Button className="md:col-span-2" disabled={pending} type="submit" variant="outline">
          {pending ? <Loader2 className="size-4 animate-spin" /> : 'Save user fields'}
        </Button>
      </form>

      <form action={saveProfile} className="grid gap-3 rounded-md border border-border/80 bg-card/70 p-3 md:grid-cols-2">
        <Input defaultValue={current.avatarUrl ?? ''} name="avatarUrl" placeholder="Avatar URL" />
        <Input defaultValue={current.bio ?? ''} name="bio" placeholder="Bio" />
        <Input defaultValue={current.countryId ?? ''} min={1} name="countryId" placeholder="Country ID" type="number" />
        <Input defaultValue={current.cityId ?? ''} min={1} name="cityId" placeholder="City ID" type="number" />
        <Button className="md:col-span-2" disabled={pending} type="submit" variant="outline">
          {pending ? <Loader2 className="size-4 animate-spin" /> : 'Save profile fields'}
        </Button>
      </form>

      <div className="rounded-md border border-border/80 bg-card/70 p-3">
        <Button disabled={pending} onClick={toggleDelete} type="button" variant={current.deletedAt ? 'outline' : 'destructive'}>
          {current.deletedAt ? 'Restore user' : 'Soft delete user'}
        </Button>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
