'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useMemo, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TurnstileWidget } from '@/features/auth/components/turnstile-widget';
import { submitPartnerRegistrationAction } from '@/features/partner-registration/actions/submit-partner-registration.action';
import {
  createPartnerRegistrationSchema,
  type PartnerRegistrationFormInput,
  type PartnerRegistrationInput,
  type PartnerRegistrationValidationMessages,
} from '@/features/partner-registration/schemas/partner-registration.schema';

interface SelectOption {
  id: number;
  label: string;
}

export interface PartnerRegistrationLabels extends PartnerRegistrationValidationMessages {
  acceptLegal: string;
  acceptLegalPrefix: string;
  back: string;
  businessName: string;
  businessNamePlaceholder: string;
  category: string;
  categoryPlaceholder: string;
  city: string;
  cityPlaceholder: string;
  confirmAuthority: string;
  country: string;
  countryPlaceholder: string;
  email: string;
  emailPlaceholder: string;
  formError: string;
  next: string;
  phone: string;
  phonePlaceholder: string;
  privacyLink: string;
  previewEmpty: string;
  previewTitle: string;
  progress: string;
  representativeName: string;
  representativeNamePlaceholder: string;
  partnerRulesLink: string;
  stepBusinessDescription: string;
  stepBusinessTitle: string;
  stepLocationDescription: string;
  stepLocationTitle: string;
  stepRepresentativeDescription: string;
  stepRepresentativeTitle: string;
  stepReviewDescription: string;
  stepReviewTitle: string;
  submit: string;
  submitting: string;
  successDescription: string;
  successStatus: string;
  successTitle: string;
  termsLink: string;
  websiteOrSocial: string;
  websiteOrSocialPlaceholder: string;
}

interface PartnerRegistrationFormProps {
  categories: SelectOption[];
  countries: SelectOption[];
  labels: PartnerRegistrationLabels;
  locale: SupportedLocale;
}

const TOTAL_STEPS = 4;

const STEP_FIELDS: Array<Array<keyof PartnerRegistrationFormInput>> = [
  ['businessName', 'categoryId'],
  ['representativeName', 'email', 'phone'],
  ['countryId', 'cityName', 'websiteOrSocial'],
  ['confirmAuthority', 'acceptLegal'],
];

export function PartnerRegistrationForm({
  categories,
  countries,
  labels,
  locale,
}: PartnerRegistrationFormProps) {
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const schema = useMemo(() => createPartnerRegistrationSchema(labels), [labels]);

  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setValue,
    trigger,
  } = useForm<PartnerRegistrationFormInput, unknown, PartnerRegistrationInput>({
    defaultValues: {
      acceptLegal: false,
      businessName: '',
      captchaToken: '',
      categoryId: undefined,
      cityName: '',
      confirmAuthority: false,
      countryId: undefined,
      email: '',
      phone: '',
      representativeName: '',
      websiteOrSocial: '',
    },
    resolver: zodResolver(schema),
  });

  const stepMeta = [
    { description: labels.stepBusinessDescription, title: labels.stepBusinessTitle },
    { description: labels.stepRepresentativeDescription, title: labels.stepRepresentativeTitle },
    { description: labels.stepLocationDescription, title: labels.stepLocationTitle },
    { description: labels.stepReviewDescription, title: labels.stepReviewTitle },
  ][step];

  async function handleNext() {
    const isValid = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (isValid) {
      setFormError(null);
      setStep((current) => Math.min(current + 1, TOTAL_STEPS - 1));
    }
  }

  function handleBack() {
    setFormError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  function onSubmit(input: PartnerRegistrationInput) {
    setFormError(null);
    startTransition(async () => {
      const result = await submitPartnerRegistrationAction(locale, input);

      if (!result.ok) {
        setFormError(result.error.message);
        setTurnstileKey((current) => current + 1);
        setValue('captchaToken', '');
        return;
      }

      setIsSubmitted(true);
    });
  }

  if (isSubmitted) {
    return (
      <div className="w-full max-w-2xl border border-ds-border bg-ds-surface/70 p-6 sm:p-8">
        <p className="text-ds-text-xs font-medium uppercase tracking-[0.18em] text-ds-accent">
          {labels.successStatus}
        </p>
        <h2 className="mt-4 text-2xl font-semibold text-ds-text">{labels.successTitle}</h2>
        <p className="mt-3 text-ds-text-sm leading-relaxed text-ds-text-muted">
          {labels.successDescription}
        </p>
      </div>
    );
  }

  return (
    <form
      className="w-full max-w-2xl border border-ds-border bg-ds-surface/70 p-5 sm:p-8"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-6">
        <p className="text-ds-text-xs font-medium uppercase tracking-[0.18em] text-ds-text-faint">
          {labels.progress
            .replace('{current}', String(step + 1))
            .replace('{total}', String(TOTAL_STEPS))}
        </p>
        <h2 className="mt-3 text-xl font-semibold text-ds-text">{stepMeta.title}</h2>
        <p className="mt-2 text-ds-text-sm leading-relaxed text-ds-text-muted">
          {stepMeta.description}
        </p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="mb-5 rounded-md border border-ds-error/40 bg-ds-error/10 px-4 py-3 text-ds-text-sm text-ds-error"
        >
          {formError}
        </p>
      ) : null}

      <div className="space-y-5">
        {step === 0 ? (
          <>
            <Field
              error={errors.businessName?.message}
              htmlFor="partner-business-name"
              label={labels.businessName}
            >
              <Input
                id="partner-business-name"
                className="min-h-11"
                placeholder={labels.businessNamePlaceholder}
                aria-describedby={errors.businessName ? 'partner-business-name-error' : undefined}
                aria-invalid={Boolean(errors.businessName)}
                disabled={pending}
                {...register('businessName')}
              />
            </Field>

            <SelectField
              control={control}
              disabled={pending}
              error={errors.categoryId?.message}
              htmlFor="partner-category"
              label={labels.category}
              name="categoryId"
              options={categories}
              placeholder={labels.categoryPlaceholder}
            />
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Field
              error={errors.representativeName?.message}
              htmlFor="partner-representative-name"
              label={labels.representativeName}
            >
              <Input
                id="partner-representative-name"
                className="min-h-11"
                placeholder={labels.representativeNamePlaceholder}
                aria-describedby={
                  errors.representativeName ? 'partner-representative-name-error' : undefined
                }
                aria-invalid={Boolean(errors.representativeName)}
                disabled={pending}
                {...register('representativeName')}
              />
            </Field>

            <Field error={errors.email?.message} htmlFor="partner-email" label={labels.email}>
              <Input
                id="partner-email"
                className="min-h-11"
                type="email"
                placeholder={labels.emailPlaceholder}
                aria-describedby={errors.email ? 'partner-email-error' : undefined}
                aria-invalid={Boolean(errors.email)}
                disabled={pending}
                {...register('email')}
              />
            </Field>

            <Field error={errors.phone?.message} htmlFor="partner-phone" label={labels.phone}>
              <Input
                id="partner-phone"
                className="min-h-11"
                type="tel"
                placeholder={labels.phonePlaceholder}
                aria-describedby={errors.phone ? 'partner-phone-error' : undefined}
                aria-invalid={Boolean(errors.phone)}
                disabled={pending}
                {...register('phone')}
              />
            </Field>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <SelectField
              control={control}
              disabled={pending}
              error={errors.countryId?.message}
              htmlFor="partner-country"
              label={labels.country}
              name="countryId"
              options={countries}
              placeholder={labels.countryPlaceholder}
            />

            <Field error={errors.cityName?.message} htmlFor="partner-city" label={labels.city}>
              <Input
                id="partner-city"
                className="min-h-11"
                placeholder={labels.cityPlaceholder}
                aria-describedby={errors.cityName ? 'partner-city-error' : undefined}
                aria-invalid={Boolean(errors.cityName)}
                disabled={pending}
                {...register('cityName')}
              />
            </Field>

            <Field
              error={errors.websiteOrSocial?.message}
              htmlFor="partner-website"
              label={labels.websiteOrSocial}
            >
              <Input
                id="partner-website"
                className="min-h-11"
                placeholder={labels.websiteOrSocialPlaceholder}
                aria-describedby={errors.websiteOrSocial ? 'partner-website-error' : undefined}
                aria-invalid={Boolean(errors.websiteOrSocial)}
                disabled={pending}
                {...register('websiteOrSocial')}
              />
            </Field>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Preview
              categories={categories}
              countries={countries}
              emptyLabel={labels.previewEmpty}
              labels={labels}
              values={getValues()}
            />

            <CheckboxField
              control={control}
              disabled={pending}
              error={errors.confirmAuthority?.message}
              htmlFor="partner-confirm-authority"
              label={labels.confirmAuthority}
              name="confirmAuthority"
            />

            <CheckboxField
              control={control}
              disabled={pending}
              error={errors.acceptLegal?.message}
              htmlFor="partner-accept-legal"
              label={<LegalConsentLabel labels={labels} locale={locale} />}
              name="acceptLegal"
            />

            <TurnstileWidget
              key={turnstileKey}
              onVerify={(token) => setValue('captchaToken', token, { shouldValidate: true })}
            />
          </>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 rounded-md"
          disabled={pending || step === 0}
          onClick={handleBack}
        >
          {labels.back}
        </Button>

        {step < TOTAL_STEPS - 1 ? (
          <Button
            type="button"
            className="min-h-11 rounded-md"
            disabled={pending}
            onClick={() => {
              void handleNext();
            }}
          >
            {labels.next}
          </Button>
        ) : (
          <Button type="submit" className="min-h-11 rounded-md" disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            {pending ? labels.submitting : labels.submit}
          </Button>
        )}
      </div>
    </form>
  );
}

function Field({
  children,
  error,
  htmlFor,
  label,
}: {
  children: ReactNode;
  error?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-ds-text-sm font-medium text-ds-text">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-ds-text-sm text-ds-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SelectField({
  control,
  disabled,
  error,
  htmlFor,
  label,
  name,
  options,
  placeholder,
}: {
  control: ReturnType<typeof useForm<PartnerRegistrationFormInput>>['control'];
  disabled: boolean;
  error?: string;
  htmlFor: string;
  label: string;
  name: 'categoryId' | 'countryId';
  options: SelectOption[];
  placeholder: string;
}) {
  return (
    <Field error={error} htmlFor={htmlFor} label={label}>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Select
            disabled={disabled}
            value={field.value ? String(field.value) : ''}
            onValueChange={(value) => field.onChange(Number(value))}
          >
            <SelectTrigger
              id={htmlFor}
              className="min-h-11"
              aria-describedby={error ? `${htmlFor}-error` : undefined}
              aria-invalid={Boolean(error)}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.id} value={String(option.id)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </Field>
  );
}

function CheckboxField({
  control,
  disabled,
  error,
  htmlFor,
  label,
  name,
}: {
  control: ReturnType<typeof useForm<PartnerRegistrationFormInput>>['control'];
  disabled: boolean;
  error?: string;
  htmlFor: string;
  label: ReactNode;
  name: 'acceptLegal' | 'confirmAuthority';
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <Checkbox
              id={htmlFor}
              className="mt-1"
              checked={Boolean(field.value)}
              disabled={disabled}
              aria-describedby={error ? `${htmlFor}-error` : undefined}
              aria-invalid={Boolean(error)}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
          )}
        />
        <label htmlFor={htmlFor} className="text-ds-text-sm leading-relaxed text-ds-text">
          {label}
        </label>
      </div>
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-ds-text-sm text-ds-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function LegalConsentLabel({
  labels,
  locale,
}: {
  labels: PartnerRegistrationLabels;
  locale: SupportedLocale;
}) {
  const linkClassName =
    'font-medium text-ds-accent underline underline-offset-4 transition-colors hover:text-ds-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-accent';

  return (
    <>
      {labels.acceptLegalPrefix}{' '}
      <Link className={linkClassName} href={localizeHref(locale, '/legal/rules/partner')}>
        {labels.partnerRulesLink}
      </Link>
      {', '}
      <Link className={linkClassName} href={localizeHref(locale, '/legal/terms')}>
        {labels.termsLink}
      </Link>
      {', '}
      <Link className={linkClassName} href={localizeHref(locale, '/legal/privacy')}>
        {labels.privacyLink}
      </Link>
      .
    </>
  );
}

function Preview({
  categories,
  countries,
  emptyLabel,
  labels,
  values,
}: {
  categories: SelectOption[];
  countries: SelectOption[];
  emptyLabel: string;
  labels: PartnerRegistrationLabels;
  values: PartnerRegistrationFormInput;
}) {
  const category = categories.find((option) => option.id === Number(values.categoryId))?.label;
  const country = countries.find((option) => option.id === Number(values.countryId))?.label;
  const rows = [
    [labels.businessName, values.businessName],
    [labels.category, category],
    [labels.representativeName, values.representativeName],
    [labels.email, values.email],
    [labels.phone, values.phone],
    [labels.country, country],
    [labels.city, values.cityName],
    [labels.websiteOrSocial, values.websiteOrSocial],
  ] as const;

  return (
    <div className="border border-ds-border bg-ds-bg/40 p-4">
      <h3 className="text-ds-text-sm font-semibold text-ds-text">{labels.previewTitle}</h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-ds-text-xs uppercase tracking-[0.14em] text-ds-text-faint">
              {label}
            </dt>
            <dd className="mt-1 break-words text-ds-text-sm text-ds-text">
              {value || emptyLabel}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
