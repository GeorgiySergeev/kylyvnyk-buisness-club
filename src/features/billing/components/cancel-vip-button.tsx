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
    <div className="rounded-md border border-border/50 bg-white/2 p-5">
      <h3 className="text-base font-semibold text-white">{labels.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg/60">{labels.description}</p>
      {periodEndLabel ? (
        <p className="mt-2 text-sm text-fg/50">{periodEndLabel}</p>
      ) : null}
      {cancelAtPeriodEnd ? (
        <p className="mt-3 text-sm font-medium text-primary">{labels.scheduled}</p>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="mt-4 min-h-11 rounded-md border-border/50 bg-transparent text-white hover:bg-white/5"
          disabled={pending}
          onClick={cancelMembership}
        >
          {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {pending ? labels.pending : labels.cta}
        </Button>
      )}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {labels.error}
        </p>
      ) : null}
    </div>
  );
}
