'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';

import { cancelVipMembershipAction } from '../actions/billing.action';

interface CancelVipButtonProps {
  cancelAtPeriodEnd: boolean;
  labels: {
    cta: string;
    description: string;
    error: string;
    pending: string;
    scheduled: string;
    title: string;
  };
  locale: SupportedLocale;
  periodEndLabel: string | null;
}

export function CancelVipButton({
  cancelAtPeriodEnd,
  labels,
  locale,
  periodEndLabel,
}: CancelVipButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function cancelMembership() {
    setError(null);
    startTransition(async () => {
      const result = await cancelVipMembershipAction(locale);

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="rounded-ds-radius-md border border-ds-border bg-ds-surface p-ds-space-5">
      <h3 className="text-ds-text-base font-semibold text-ds-text">{labels.title}</h3>
      <p className="mt-2 text-ds-text-sm leading-relaxed text-ds-text-muted">{labels.description}</p>
      {periodEndLabel ? (
        <p className="mt-2 text-ds-text-sm text-ds-text-muted">{periodEndLabel}</p>
      ) : null}
      {cancelAtPeriodEnd ? (
        <p className="mt-3 text-ds-text-sm font-medium text-ds-accent">{labels.scheduled}</p>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="mt-ds-space-4 min-h-11 rounded-ds-radius-md border-ds-border bg-transparent text-ds-text hover:bg-ds-surface-hover"
          disabled={pending}
          onClick={cancelMembership}
        >
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {pending ? labels.pending : labels.cta}
        </Button>
      )}
      {error ? (
        <p role="alert" className="mt-3 text-ds-text-sm text-ds-error">
          {labels.error}
        </p>
      ) : null}
    </div>
  );
}
