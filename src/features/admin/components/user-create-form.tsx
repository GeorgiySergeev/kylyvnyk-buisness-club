'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DEFAULT_PHONE_INPUT_LABELS, RhfPhoneInput } from '@/components/ui/rhf-phone-input';
import { createUserAction } from '@/features/admin/actions/user-admin.action';

const createUserFormSchema = z.object({
  displayName: z.string().trim().max(120),
  email: z.union([z.string().email(), z.literal('')]),
  issueCard: z.boolean(),
  membershipTier: z.enum(['', 'FREE', 'VIP', 'BUSINESS']),
  phone: z.string().trim().min(6, 'Phone must be at least 6 characters').max(32),
  role: z.enum(['GUEST', 'MEMBER', 'MANAGER', 'ADMIN', 'OWNER']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED']),
});

type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

interface UserCreateFormLabels {
  create: string;
  displayName: string;
  email: string;
  issueCard: string;
  membership: string;
  noMembership: string;
  phone: string;
  role: string;
  status: string;
}

interface UserCreateFormProps {
  labels: UserCreateFormLabels;
  locale: SupportedLocale;
}

export function UserCreateForm({ labels, locale }: UserCreateFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<CreateUserFormValues>({
    defaultValues: {
      displayName: '',
      email: '',
      issueCard: true,
      membershipTier: '',
      phone: '',
      role: 'MEMBER',
      status: 'ACTIVE',
    },
    resolver: zodResolver(createUserFormSchema),
  });

  const issueCard = watch('issueCard');

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await createUserAction(
        {
          displayName: values.displayName.trim() || null,
          email: values.email || undefined,
          issueCard: values.issueCard,
          membershipTier: values.membershipTier || undefined,
          phone: values.phone,
          role: values.role,
          status: values.status,
        },
        locale,
      );

      if (!result.ok) {
        setError('root', { message: result.error, type: 'server' });
        return;
      }

      router.push(localizeHref(locale, `/admin/users/${result.data.userId}`));
    });
  });

  return (
    <form className="max-w-2xl space-y-5 rounded-lg border border-border bg-card p-5" noValidate onSubmit={onSubmit}>
      {errors.root?.message ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {errors.root.message}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="displayName">{labels.displayName}</Label>
          <Input
            aria-describedby={errors.displayName ? 'displayName-error' : undefined}
            aria-invalid={Boolean(errors.displayName)}
            disabled={pending}
            id="displayName"
            placeholder={labels.displayName}
            {...register('displayName')}
          />
          {errors.displayName?.message ? (
            <p className="text-sm text-destructive" id="displayName-error" role="alert">
              {errors.displayName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{labels.phone}</Label>
          <RhfPhoneInput
            control={control}
            name="phone"
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            aria-invalid={Boolean(errors.phone)}
            countrySearchPlaceholder={DEFAULT_PHONE_INPUT_LABELS.countrySearchPlaceholder}
            countrySelectLabel={DEFAULT_PHONE_INPUT_LABELS.countrySelectLabel}
            defaultCountry="ua"
            disabled={pending}
            id="phone"
            placeholder="+380501234567"
            required
          />
          {errors.phone?.message ? (
            <p className="text-sm text-destructive" id="phone-error" role="alert">
              {errors.phone.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">{labels.email}</Label>
          <Input
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={Boolean(errors.email)}
            disabled={pending}
            id="email"
            placeholder="user@example.com"
            type="email"
            {...register('email')}
          />
          {errors.email?.message ? (
            <p className="text-sm text-destructive" id="email-error" role="alert">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="membershipTier">{labels.membership}</Label>
          <select
            className="min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending}
            id="membershipTier"
            {...register('membershipTier')}
          >
            <option value="">{labels.noMembership}</option>
            <option value="FREE">FREE</option>
            <option value="VIP">VIP</option>
            <option value="BUSINESS">BUSINESS</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">{labels.role}</Label>
          <select
            className="min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending}
            id="role"
            {...register('role')}
          >
            <option value="GUEST">Guest</option>
            <option value="MEMBER">Member</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Owner</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">{labels.status}</Label>
          <select
            className="min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending}
            id="status"
            {...register('status')}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Checkbox
          checked={issueCard}
          disabled={pending}
          id="issueCard"
          onCheckedChange={(checked) => setValue('issueCard', checked === true, { shouldDirty: true })}
        />
        <Label className="cursor-pointer font-normal" htmlFor="issueCard">
          {labels.issueCard}
        </Label>
      </div>

      <Button disabled={pending} type="submit">
        {pending ? <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" /> : null}
        {labels.create}
      </Button>
    </form>
  );
}
