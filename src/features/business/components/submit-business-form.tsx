'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { submitBusinessAction } from '../actions/submit-business.action';
import {
  type SubmitBusinessFormInput,
  type SubmitBusinessInput,
  submitBusinessSchema,
} from '../schemas/submit-business.schema';

interface SelectOption {
  id: number;
  label: string;
}

interface SubmitBusinessFormLabels {
  category: string;
  city: string;
  country: string;
  description: string;
  email: string;
  formError: string;
  name: string;
  optional: string;
  phone: string;
  representativeName: string;
  submit: string;
  submitting: string;
  website: string;
}

interface SubmitBusinessFormProps {
  categories: SelectOption[];
  cities: SelectOption[];
  countries: SelectOption[];
  defaultValues: SubmitBusinessFormInput;
  labels: SubmitBusinessFormLabels;
  locale: SupportedLocale;
}

export function SubmitBusinessForm({
  categories,
  cities,
  countries,
  defaultValues,
  labels,
  locale,
}: SubmitBusinessFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<SubmitBusinessFormInput, unknown, SubmitBusinessInput>({
    defaultValues,
    resolver: zodResolver(submitBusinessSchema),
  });

  function onSubmit(values: SubmitBusinessInput) {
    setFormError(null);
    startTransition(async () => {
      const result = await submitBusinessAction(locale, values);

      if (!result.ok) {
        setFormError(result.error.message);
        return;
      }

      router.push(result.data.redirectTo);
      router.refresh();
    });
  }

  return (
    <form className="w-full max-w-2xl space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
      {formError ? (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <Field label={labels.name} error={errors.name?.message} htmlFor="business-name">
        <Input id="business-name" className="min-h-11" disabled={pending} {...register('name')} />
      </Field>

      <Field
        label={labels.representativeName}
        error={errors.representativeName?.message}
        htmlFor="representative-name"
      >
        <Input
          id="representative-name"
          className="min-h-11"
          disabled={pending}
          {...register('representativeName')}
        />
      </Field>

      <Field label={labels.email} error={errors.email?.message} htmlFor="business-email">
        <Input id="business-email" type="email" className="min-h-11" disabled={pending} {...register('email')} />
      </Field>

      <Field label={labels.phone} error={errors.phone?.message} htmlFor="business-phone">
        <Input id="business-phone" className="min-h-11" disabled={pending} {...register('phone')} />
      </Field>

      <Field label={labels.country} error={errors.countryId?.message} htmlFor="business-country">
        <select
          id="business-country"
          className="min-h-11 w-full rounded-md border border-border/50 bg-transparent px-3 text-sm text-white"
          disabled={pending}
          {...register('countryId')}
        >
          <option value="">{labels.country}</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={labels.city} error={errors.cityId?.message} htmlFor="business-city">
        <select
          id="business-city"
          className="min-h-11 w-full rounded-md border border-border/50 bg-transparent px-3 text-sm text-white"
          disabled={pending}
          {...register('cityId')}
        >
          <option value="">{labels.city}</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={labels.category} error={errors.categoryId?.message} htmlFor="business-category">
        <select
          id="business-category"
          className="min-h-11 w-full rounded-md border border-border/50 bg-transparent px-3 text-sm text-white"
          disabled={pending}
          {...register('categoryId')}
        >
          <option value="">{labels.category}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={labels.website} error={errors.website?.message} htmlFor="business-website" optional={labels.optional}>
        <Input id="business-website" className="min-h-11" disabled={pending} {...register('website')} />
      </Field>

      <Field
        label={labels.description}
        error={errors.description?.message}
        htmlFor="business-description"
        optional={labels.optional}
      >
        <Textarea id="business-description" disabled={pending} rows={4} {...register('description')} />
      </Field>

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

function Field({
  children,
  error,
  htmlFor,
  label,
  optional,
}: {
  children: ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
  optional?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-white">
        {label}
        {optional ? <span className="ml-2 text-xs text-fg/45">({optional})</span> : null}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
