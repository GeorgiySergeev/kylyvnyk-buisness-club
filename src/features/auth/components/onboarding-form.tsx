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

  const fieldSelectClass =
    'min-h-11 w-full rounded-md border border-border/50 bg-transparent px-3 py-2 text-sm text-white transition-colors outline-none focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-xl space-y-6 border border-border/50 bg-white/2 p-6 sm:p-8"
      noValidate
    >
      {errors.root?.message ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {errors.root.message}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="countryId" className="text-sm font-medium text-white">
            {labels.country} <span className="text-fg/50">({labels.optional})</span>
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
            <p id="countryId-error" role="alert" className="text-sm text-destructive">
              {errors.countryId.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="cityId" className="text-sm font-medium text-white">
            {labels.city} <span className="text-fg/50">({labels.optional})</span>
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
            <p id="cityId-error" role="alert" className="text-sm text-destructive">
              {errors.cityId.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="bio" className="text-sm font-medium text-white">
          {labels.bio} <span className="text-fg/50">({labels.optional})</span>
        </label>
        <Textarea
          id="bio"
          aria-describedby={errors.bio ? 'bio-error' : undefined}
          aria-invalid={Boolean(errors.bio)}
          disabled={pending}
          className="min-h-28 rounded-md border-border/50 bg-transparent"
          {...register('bio')}
        />
        {errors.bio?.message ? (
          <p id="bio-error" role="alert" className="text-sm text-destructive">
            {errors.bio.message}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-md border border-border/50 bg-black text-white hover:bg-white/5"
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? labels.submitting : labels.submit}
      </Button>
    </form>
  );
}
