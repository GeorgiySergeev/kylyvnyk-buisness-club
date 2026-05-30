'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export interface ErrorFallbackProps {
  backHomeHref: string;
  backHomeLabel: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  title: string;
}

export function ErrorFallback({
  backHomeHref,
  backHomeLabel,
  description,
  onRetry,
  retryLabel,
  title,
}: ErrorFallbackProps) {
  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center"
    >
      <div className="space-y-3">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
        <p className="text-sm leading-relaxed text-fg/60 sm:text-base">{description}</p>
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
