'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { completeOnboardingAction } from '../actions/complete-onboarding.action';
import {
  type OnboardingFormInput,
  type OnboardingInput,
  onboardingSchema,
} from '../schemas/onboarding.schema';

interface SelectOption {
  id: number;
  label: string;
}

interface OnboardingFormLabels {
  bio: string;
  city: string;
  country: string;
  displayName: string;
  formError: string;
  optional: string;
  submit: string;
  submitting: string;
}

interface OnboardingFormProps {
  cities: SelectOption[];
  countries: SelectOption[];
  defaultValues: OnboardingFormInput;
  labels: OnboardingFormLabels;
  locale: SupportedLocale;
}

export function OnboardingForm({
  cities,
  countries,
  defaultValues,
  labels,
  locale,
}: OnboardingFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<OnboardingFormInput, unknown, OnboardingInput>({
    defaultValues,
    resolver: zodResolver(onboardingSchema),
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await completeOnboardingAction(locale, values);

      if (!result.ok) {
        if (result.error.fieldErrors) {
          Object.entries(result.error.fieldErrors).forEach(([field, messages]) => {
            if (messages?.[0]) {
              setError(field as keyof OnboardingFormInput, {
                message: messages[0],
                type: 'server',
              });
            }
          });
        }

        setError('root', {
          message: result.error.message || labels.formError,
          type: result.error.code,
        });
        return;
      }

      router.push(result.data.redirectTo);
      router.refresh();
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {errors.root?.message ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="displayName" className="text-sm font-semibold text-foreground">
          {labels.displayName}{' '}
          <span className="text-muted-foreground">({labels.optional})</span>
        </label>
        <Input
          id="displayName"
          autoComplete="name"
          aria-describedby={errors.displayName ? 'displayName-error' : undefined}
          aria-invalid={Boolean(errors.displayName)}
          disabled={pending}
          className="min-h-11"
          {...register('displayName')}
        />
        {errors.displayName?.message ? (
          <p id="displayName-error" role="alert" className="text-sm text-destructive">
            {errors.displayName.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="countryId" className="text-sm font-semibold text-foreground">
            {labels.country} <span className="text-muted-foreground">({labels.optional})</span>
          </label>
          <select
            id="countryId"
            aria-describedby={errors.countryId ? 'countryId-error' : undefined}
            aria-invalid={Boolean(errors.countryId)}
            disabled={pending}
            className="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('countryId')}
          >
            <option value="" />
            {countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.label}
              </option>
            ))}
          </select>
          {errors.countryId?.message ? (
            <p id="countryId-error" role="alert" className="text-sm text-destructive">
              {errors.countryId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="cityId" className="text-sm font-semibold text-foreground">
            {labels.city} <span className="text-muted-foreground">({labels.optional})</span>
          </label>
          <select
            id="cityId"
            aria-describedby={errors.cityId ? 'cityId-error' : undefined}
            aria-invalid={Boolean(errors.cityId)}
            disabled={pending}
            className="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            {...register('cityId')}
          >
            <option value="" />
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.label}
              </option>
            ))}
          </select>
          {errors.cityId?.message ? (
            <p id="cityId-error" role="alert" className="text-sm text-destructive">
              {errors.cityId.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-semibold text-foreground">
          {labels.bio} <span className="text-muted-foreground">({labels.optional})</span>
        </label>
        <Textarea
          id="bio"
          aria-describedby={errors.bio ? 'bio-error' : undefined}
          aria-invalid={Boolean(errors.bio)}
          disabled={pending}
          className="min-h-28"
          {...register('bio')}
        />
        {errors.bio?.message ? (
          <p id="bio-error" role="alert" className="text-sm text-destructive">
            {errors.bio.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending} className="min-h-11 w-full sm:w-auto">
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
