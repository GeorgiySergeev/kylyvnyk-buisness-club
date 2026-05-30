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
  'min-h-11 w-full rounded-md border border-border/50 bg-white/5 px-3 text-sm text-white outline-none transition-colors placeholder:text-fg/40 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50';

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
          className={cn(
            'rounded-md border px-4 py-3 text-sm',
            isDashboard
              ? 'border-destructive/40 bg-destructive/10 text-destructive'
              : 'alert alert-error rounded-box',
          )}
          role="alert"
        >
          <span>{errors.root.message}</span>
        </div>
      ) : null}

      {successMessage ? (
        <div
          className={cn(
            'rounded-md border px-4 py-3 text-sm',
            isDashboard
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'alert alert-success rounded-box',
          )}
          role="status"
        >
          <span>{successMessage}</span>
        </div>
      ) : null}

      <div className="space-y-2">
        <label
          className={cn('text-sm font-semibold', isDashboard ? 'text-white' : 'text-foreground')}
          htmlFor="targetBusinessId"
        >
          {labels.selectBusiness}
        </label>
        <select
          aria-describedby={errors.targetBusinessId ? 'targetBusinessId-error' : undefined}
          aria-invalid={Boolean(errors.targetBusinessId)}
          className={cn(
            isDashboard ? fieldSelectClass : 'select select-bordered min-h-11 w-full rounded-field bg-background',
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
          <p className="text-sm text-destructive" id="targetBusinessId-error" role="alert">
            {errors.targetBusinessId.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label
            className={cn('text-sm font-semibold', isDashboard ? 'text-white' : 'text-foreground')}
            htmlFor="clientName"
          >
            {labels.clientName}
          </label>
          <input
            aria-describedby={errors.clientName ? 'clientName-error' : undefined}
            aria-invalid={Boolean(errors.clientName)}
            className={cn(isDashboard ? dashboardFieldClass : 'input input-bordered min-h-11 w-full rounded-field bg-background')}
            disabled={pending}
            id="clientName"
            type="text"
            {...register('clientName')}
          />
          {errors.clientName?.message ? (
            <p className="text-sm text-destructive" id="clientName-error" role="alert">
              {errors.clientName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label
            className={cn('text-sm font-semibold', isDashboard ? 'text-white' : 'text-foreground')}
            htmlFor="clientContact"
          >
            {labels.clientContact}
          </label>
          <input
            aria-describedby="clientContact-help clientContact-error"
            aria-invalid={Boolean(errors.clientContact)}
            className={cn(isDashboard ? dashboardFieldClass : 'input input-bordered min-h-11 w-full rounded-field bg-background')}
            disabled={pending}
            id="clientContact"
            type="text"
            {...register('clientContact')}
          />
          <p
            className={cn('text-xs leading-5', isDashboard ? 'text-fg/50' : 'text-muted-foreground')}
            id="clientContact-help"
          >
            {labels.clientContactHelp}
          </p>
          {errors.clientContact?.message ? (
            <p className="text-sm text-destructive" id="clientContact-error" role="alert">
              {errors.clientContact.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label
          className={cn('text-sm font-semibold', isDashboard ? 'text-white' : 'text-foreground')}
          htmlFor="message"
        >
          {labels.message}{' '}
          <span className={isDashboard ? 'text-fg/45' : 'text-muted-foreground'}>({labels.optional})</span>
        </label>
        <textarea
          aria-describedby="message-help message-error"
          aria-invalid={Boolean(errors.message)}
          className={cn(
            'min-h-28 w-full resize-y px-3 py-2 text-sm outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-50',
            isDashboard
              ? 'rounded-md border border-border/50 bg-white/5 text-white placeholder:text-fg/40 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/10'
              : 'textarea textarea-bordered rounded-field bg-background',
          )}
          disabled={pending}
          id="message"
          {...register('message')}
        />
        <p
          className={cn('text-xs leading-5', isDashboard ? 'text-fg/50' : 'text-muted-foreground')}
          id="message-help"
        >
          {labels.messageHelp}
        </p>
        {errors.message?.message ? (
          <p className="text-sm text-destructive" id="message-error" role="alert">
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
        <button
          className="btn btn-primary min-h-11 rounded-field"
          disabled={pending || businesses.length === 0}
          type="submit"
        >
          {pending ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
          {pending ? labels.submitting : labels.submit}
        </button>
      )}
    </form>
  );
}
