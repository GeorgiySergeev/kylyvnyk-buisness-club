'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export interface ErrorFallbackProps {
  backHomeHref: string;
  backHomeLabel: string;
  description: string;
  errorCode?: string;
  onRetry?: () => void;
  retryLabel?: string;
  title: string;
}

export function ErrorFallback({
  backHomeHref,
  backHomeLabel,
  description,
  errorCode,
  onRetry,
  retryLabel,
  title,
}: ErrorFallbackProps) {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-8 px-4 py-16 text-center"
    >
      {/* Icon */}
      <div className="flex size-16 items-center justify-center rounded-full border border-ds-error/30 bg-ds-error/10">
        <AlertTriangle aria-hidden="true" className="size-7 text-ds-error" strokeWidth={1.5} />
      </div>

      <div className="space-y-3">
        {errorCode && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ds-text-faint">
            Error {errorCode}
          </p>
        )}
        <h1 className="text-ds-display-3 font-bold tracking-tight text-ds-text">
          {title}
        </h1>
        <p className="max-w-prose text-ds-text-sm leading-relaxed text-ds-text-muted sm:text-ds-text-base">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && retryLabel ? (
          <Button type="button" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link href={backHomeHref}>{backHomeLabel}</Link>
        </Button>
      </div>
    </main>
  );
}

