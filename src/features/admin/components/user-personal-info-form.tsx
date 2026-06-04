'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';

import { updateUserDetailsAction, updateUserProfileAction } from '../actions/user-admin.action';

const personalInfoSchema = z.object({
  avatarUrl: z.union([z.string().url(), z.literal('')]),
  bio: z.string().trim().max(2000),
  displayName: z.string().trim().min(1).max(120),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

interface UserPersonalInfoFormProps {
  userId: string;
  defaultValues: {
    avatarUrl: string | null;
    bio: string | null;
    displayName: string | null;
  };
}

export function UserPersonalInfoForm({ userId, defaultValues }: UserPersonalInfoFormProps) {
  const { pending, refresh, run } = useAdminMutation();
  const [saved, setSaved] = useState(false);

  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<PersonalInfoFormValues>({
    defaultValues: {
      avatarUrl: defaultValues.avatarUrl ?? '',
      bio: defaultValues.bio ?? '',
      displayName: defaultValues.displayName ?? '',
    },
    resolver: zodResolver(personalInfoSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false);
    const result = await run(async () => {
      const detailsResult = await updateUserDetailsAction({
        displayName: values.displayName,
        userId,
      });

      if (!detailsResult.ok) {
        return detailsResult;
      }

      return updateUserProfileAction({
        avatarUrl: values.avatarUrl || null,
        bio: values.bio || null,
        userId,
      });
    });

    if (!result.ok) {
      setError('root', { message: result.error, type: 'server' });
      return;
    }

    reset(values);
    setSaved(true);
    refresh();
  });

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      {errors.root?.message ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {errors.root.message}
        </p>
      ) : null}

      {saved ? (
        <p className="text-sm text-ds-success" role="status">
          Saved successfully.
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          aria-describedby={errors.displayName ? 'displayName-error' : undefined}
          aria-invalid={Boolean(errors.displayName)}
          disabled={pending}
          id="displayName"
          placeholder="Full name"
          {...register('displayName')}
        />
        {errors.displayName?.message ? (
          <p className="text-sm text-destructive" id="displayName-error" role="alert">
            {errors.displayName.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          aria-describedby={errors.avatarUrl ? 'avatarUrl-error' : undefined}
          aria-invalid={Boolean(errors.avatarUrl)}
          disabled={pending}
          id="avatarUrl"
          placeholder="https://example.com/avatar.jpg"
          type="url"
          {...register('avatarUrl')}
        />
        {errors.avatarUrl?.message ? (
          <p className="text-sm text-destructive" id="avatarUrl-error" role="alert">
            {errors.avatarUrl.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          aria-describedby={errors.bio ? 'bio-error' : undefined}
          aria-invalid={Boolean(errors.bio)}
          className="min-h-28"
          disabled={pending}
          id="bio"
          placeholder="Tell us about this user..."
          {...register('bio')}
        />
        {errors.bio?.message ? (
          <p className="text-sm text-destructive" id="bio-error" role="alert">
            {errors.bio.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <Button disabled={pending || !isDirty} type="submit">
          {pending ? <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" /> : null}
          Save
        </Button>
        <Button
          disabled={pending || !isDirty}
          onClick={() => {
            reset();
            setSaved(false);
          }}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
