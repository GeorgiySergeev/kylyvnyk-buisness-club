'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
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
      try {
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
      } catch (e) {
        setError('root', {
          message: e instanceof Error ? e.message : labels.formError,
          type: 'SERVER_ERROR',
        });
      }
    });
  });

  const fieldSelectClass =
    'min-h-11 w-full rounded-ds-radius-md border border-ds-border bg-transparent px-ds-space-3 py-ds-space-2 text-ds-text-sm text-ds-text transition-colors outline-none focus-visible:border-ds-border focus-visible:ring-1 focus-visible:ring-ds-border/50 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-xl space-y-ds-space-6 rounded-ds-radius-lg border border-ds-border bg-ds-surface p-ds-space-6 sm:p-ds-space-8"
      noValidate
    >
      {errors.root?.message ? (
        <p
          role="alert"
          className="rounded-ds-radius-md border border-ds-error/40 bg-ds-error/10 px-ds-space-4 py-ds-space-3 text-ds-text-sm text-ds-error"
        >
          {errors.root.message}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="countryId" className="text-ds-text-sm font-medium text-ds-text">
            {labels.country}
          </label>
          <select
            id="countryId"
            aria-describedby={errors.countryId ? 'countryId-error' : undefined}
            aria-invalid={Boolean(errors.countryId)}
            disabled={pending}
            className={fieldSelectClass}
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
            <p id="countryId-error" role="alert" className="text-ds-text-sm text-ds-error">
              {errors.countryId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="cityId" className="text-ds-text-sm font-medium text-ds-text">
            {labels.city} <span className="text-ds-text-muted">({labels.optional})</span>
          </label>
          <select
            id="cityId"
            aria-describedby={errors.cityId ? 'cityId-error' : undefined}
            aria-invalid={Boolean(errors.cityId)}
            disabled={pending}
            className={fieldSelectClass}
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
            <p id="cityId-error" role="alert" className="text-ds-text-sm text-ds-error">
              {errors.cityId.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-ds-text-sm font-medium text-ds-text">
          {labels.bio} <span className="text-ds-text-muted">({labels.optional})</span>
        </label>
        <Textarea
          id="bio"
          aria-describedby={errors.bio ? 'bio-error' : undefined}
          aria-invalid={Boolean(errors.bio)}
          disabled={pending}
          className="min-h-28 rounded-ds-radius-md border-ds-border bg-transparent text-ds-text"
          {...register('bio')}
        />
        {errors.bio?.message ? (
          <p id="bio-error" role="alert" className="text-ds-text-sm text-ds-error">
            {errors.bio.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-ds-radius-md border border-ds-border bg-ds-surface-hover text-ds-text hover:bg-ds-surface-hover-2"
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
