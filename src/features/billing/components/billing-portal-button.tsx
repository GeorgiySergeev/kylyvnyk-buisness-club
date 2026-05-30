'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';

import { createBillingPortalSessionAction } from '../actions/billing.action';

interface BillingPortalButtonProps {
  errorLabel: string;
  labels: {
    cta: string;
    pending: string;
  };
  locale: SupportedLocale;
}

export function BillingPortalButton({ errorLabel, labels, locale }: BillingPortalButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openPortal() {
    setError(null);
    startTransition(async () => {
      const result = await createBillingPortalSessionAction(locale);

      if (!result.ok) {
        setError(result.error.message || errorLabel);
        return;
      }

      router.push(result.data.url);
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="min-h-11 rounded-md border-border/50 bg-transparent text-white hover:bg-white/5"
        disabled={pending}
        onClick={openPortal}
      >
        {pending ? <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" /> : null}
        {pending ? labels.pending : labels.cta}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
