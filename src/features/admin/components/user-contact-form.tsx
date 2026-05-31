'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';

import { updateUserDetailsAction, updateUserProfileAction } from '../actions/user-admin.action';

const contactSchema = z.object({
  cityId: z.string(),
  countryId: z.string(),
  email: z.union([z.string().email(), z.literal('')]),
  phone: z.string().trim().min(6, 'Phone must be at least 6 characters').max(32),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface SelectOption {
  id: number;
  name: string;
}

interface UserContactFormProps {
  cities: SelectOption[];
  countries: SelectOption[];
  defaultValues: {
    cityId: number | null;
    countryId: number | null;
    email: string | null;
    phone: string;
  };
  userId: string;
}

export function UserContactForm({
  cities,
  countries,
  defaultValues,
  userId,
}: UserContactFormProps) {
  const { pending, refresh, run } = useAdminMutation();
  const [saved, setSaved] = useState(false);

  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<ContactFormValues>({
    defaultValues: {
      cityId: defaultValues.cityId ? String(defaultValues.cityId) : '',
      countryId: defaultValues.countryId ? String(defaultValues.countryId) : '',
      email: defaultValues.email ?? '',
      phone: defaultValues.phone,
    },
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaved(false);
    const result = await run(async () => {
      const detailsResult = await updateUserDetailsAction({
        email: values.email || null,
        phone: values.phone,
        userId,
      });

      if (!detailsResult.ok) {
        return detailsResult;
      }

      return updateUserProfileAction({
        cityId: values.cityId ? Number(values.cityId) : null,
        countryId: values.countryId ? Number(values.countryId) : null,
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
        <p className="text-sm text-emerald-600" role="status">
          Saved successfully.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            aria-invalid={Boolean(errors.phone)}
            disabled={pending}
            id="phone"
            placeholder="+1 234 567 890"
            {...register('phone')}
          />
          {errors.phone?.message ? (
            <p className="text-sm text-destructive" id="phone-error" role="alert">
              {errors.phone.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
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
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="countryId">Country</Label>
          <select
            aria-describedby={errors.countryId ? 'countryId-error' : undefined}
            aria-invalid={Boolean(errors.countryId)}
            className="min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending}
            id="countryId"
            {...register('countryId')}
          >
            <option value="">Select country</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.countryId?.message ? (
            <p className="text-sm text-destructive" id="countryId-error" role="alert">
              {errors.countryId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cityId">City</Label>
          <select
            aria-describedby={errors.cityId ? 'cityId-error' : undefined}
            aria-invalid={Boolean(errors.cityId)}
            className="min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending}
            id="cityId"
            {...register('cityId')}
          >
            <option value="">Select city</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.cityId?.message ? (
            <p className="text-sm text-destructive" id="cityId-error" role="alert">
              {errors.cityId.message}
            </p>
          ) : null}
        </div>
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
