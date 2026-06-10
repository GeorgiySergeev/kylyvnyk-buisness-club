'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { fieldSelectClass } from '@/features/profile/components/dashboard-profile-shared';
import { cn } from '@/lib/utils';

import { submitIntroductionAction } from '../actions/submit-introduction.action';
import {
  type IntroductionRequestFormInput,
  type IntroductionRequestInput,
  introductionRequestSchema,
} from '../schemas/introduction.schema';

export interface IntroductionBusinessOption {
  category?: string | null;
  city?: string | null;
  country?: string | null;
  id: string;
  name: string;
}

interface IntroductionFormLabels {
  clientContact: string;
  clientContactHelp: string;
  clientName: string;
  formError: string;
  message: string;
  messageHelp: string;
  optional: string;
  selectBusiness: string;
  selectPlaceholder: string;
  submit: string;
  submitting: string;
  success: string;
}

interface IntroductionFormProps {
  businesses: IntroductionBusinessOption[];
  labels: IntroductionFormLabels;
  locale: SupportedLocale;
  variant?: 'default' | 'dashboard';
}

const dashboardFieldClass =
  'min-h-11 w-full rounded-ds-radius-md border border-ds-border bg-ds-surface px-ds-space-3 text-ds-text-sm text-ds-text outline-none transition-colors placeholder:text-ds-text-muted focus-visible:border-ds-border focus-visible:ring-1 focus-visible:ring-ds-border/50 disabled:cursor-not-allowed disabled:opacity-50';

export function IntroductionForm({
  businesses,
  labels,
  locale,
  variant = 'default',
}: IntroductionFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const isDashboard = variant === 'dashboard';
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<IntroductionRequestFormInput, unknown, IntroductionRequestInput>({
    defaultValues: {
      clientContact: '',
      clientName: '',
      message: '',
      targetBusinessId: '',
    },
    resolver: zodResolver(introductionRequestSchema),
  });

  const onSubmit = handleSubmit((values) => {
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await submitIntroductionAction(locale, values);

      if (!result.ok) {
        if (result.error.fieldErrors) {
          Object.entries(result.error.fieldErrors).forEach(([field, messages]) => {
            if (messages?.[0]) {
              setError(field as keyof IntroductionRequestFormInput, {
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

      reset();
      setSuccessMessage(labels.success);
      router.refresh();
    });
  });

  return (
    <form className="space-y-5" noValidate onSubmit={onSubmit}>
      {errors.root?.message ? (
        <div
          className="rounded-md border border-ds-error/40 bg-ds-error/10 px-4 py-3 text-sm text-ds-error"
          role="alert"
        >
          <span>{errors.root.message}</span>
        </div>
      ) : null}

      {successMessage ? (
        <div
          className="rounded-md border border-ds-accent/40 bg-ds-accent/10 px-4 py-3 text-sm text-ds-accent"
          role="status"
        >
          <span>{successMessage}</span>
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          className="text-ds-text-sm font-semibold text-ds-text"
          htmlFor="targetBusinessId"
        >
          {labels.selectBusiness}
        </label>
        <select
          aria-describedby={errors.targetBusinessId ? 'targetBusinessId-error' : undefined}
          aria-invalid={Boolean(errors.targetBusinessId)}
          className={cn(
            isDashboard ? fieldSelectClass : 'min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          disabled={pending || businesses.length === 0}
          id="targetBusinessId"
          {...register('targetBusinessId')}
        >
          <option value="">{labels.selectPlaceholder}</option>
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {[business.name, business.city, business.country].filter(Boolean).join(' - ')}
            </option>
          ))}
        </select>
        {errors.targetBusinessId?.message ? (
          <p className="text-ds-text-sm text-ds-error" id="targetBusinessId-error" role="alert">
            {errors.targetBusinessId.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label
            className="text-ds-text-sm font-semibold text-ds-text"
            htmlFor="clientName"
          >
            {labels.clientName}
          </label>
          <input
            aria-describedby={errors.clientName ? 'clientName-error' : undefined}
            aria-invalid={Boolean(errors.clientName)}
            className={cn(isDashboard ? dashboardFieldClass : 'min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50')}
            disabled={pending}
            id="clientName"
            type="text"
            {...register('clientName')}
          />
          {errors.clientName?.message ? (
            <p className="text-ds-text-sm text-ds-error" id="clientName-error" role="alert">
              {errors.clientName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className="text-ds-text-sm font-semibold text-ds-text"
            htmlFor="clientContact"
          >
            {labels.clientContact}
          </label>
          <input
            aria-describedby="clientContact-help clientContact-error"
            aria-invalid={Boolean(errors.clientContact)}
            className={cn(isDashboard ? dashboardFieldClass : 'min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50')}
            disabled={pending}
            id="clientContact"
            type="text"
            {...register('clientContact')}
          />
          <p
            className="text-ds-text-xs leading-5 text-ds-text-muted"
            id="clientContact-help"
          >
            {labels.clientContactHelp}
          </p>
          {errors.clientContact?.message ? (
            <p className="text-ds-text-sm text-ds-error" id="clientContact-error" role="alert">
              {errors.clientContact.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label
          className="text-ds-text-sm font-semibold text-ds-text"
          htmlFor="message"
        >
          {labels.message}{' '}
          <span className="text-ds-text-muted">({labels.optional})</span>
        </label>
        <textarea
          aria-describedby="message-help message-error"
          aria-invalid={Boolean(errors.message)}
          className={cn(
            'min-h-28 w-full resize-y px-3 py-2 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            isDashboard
              ? 'rounded-ds-radius-md border border-ds-border bg-ds-surface text-ds-text placeholder:text-ds-text-muted focus-visible:border-ds-border focus-visible:ring-1 focus-visible:ring-ds-border/50'
              : 'min-h-28 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
          )}
          disabled={pending}
          id="message"
          {...register('message')}
        />
        <p
          className="text-ds-text-xs leading-5 text-ds-text-muted"
          id="message-help"
        >
          {labels.messageHelp}
        </p>
        {errors.message?.message ? (
          <p className="text-ds-text-sm text-ds-error" id="message-error" role="alert">
            {errors.message.message}
          </p>
        ) : null}
      </div>

      {isDashboard ? (
        <Button
          className="min-h-11 w-full rounded-md"
          disabled={pending || businesses.length === 0}
          type="submit"
        >
          {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
          {pending ? labels.submitting : labels.submit}
        </Button>
      ) : (
        <Button
          className="w-full"
          disabled={pending || businesses.length === 0}
          type="submit"
        >
          {pending ? <Loader2 aria-hidden="true" className="animate-spin" /> : null}
          {pending ? labels.submitting : labels.submit}
        </Button>
      )}
    </form>
  );
}
