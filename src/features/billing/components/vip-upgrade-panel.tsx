'use client';

import { useState, useTransition } from 'react';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';

import { createVipCheckoutAction } from '../actions/billing.action';

interface VipUpgradePanelProps {
  labels: {
    cta: string;
    description: string;
    error: string;
    pending: string;
    title: string;
  };
  locale: SupportedLocale;
}

export function VipUpgradePanel({ labels, locale }: VipUpgradePanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function startCheckout() {
    setError(null);
    startTransition(async () => {
      const result = await createVipCheckoutAction(locale);

      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      router.push(result.data.url);
    });
  }

  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-5">
      <h3 className="text-base font-semibold text-white">{labels.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg/60">{labels.description}</p>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {labels.error}
        </p>
      ) : null}
      <Button
        type="button"
        className="mt-4 min-h-11 w-full rounded-md border border-primary/40 hover:bg-primary/10"
        disabled={pending}
        onClick={startCheckout}
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {pending ? labels.pending : labels.cta}
      </Button>
    </div>
  );
}
