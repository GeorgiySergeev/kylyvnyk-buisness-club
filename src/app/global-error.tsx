'use client';

import { useEffect } from 'react';

import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';

import { ErrorFallback } from '@/components/error/error-fallback';
import { getErrorMessages } from '@/lib/i18n/error-messages';

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const messages = getErrorMessages('en');

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ErrorFallback
          title={messages.title}
          description={messages.description}
          retryLabel={messages.retry}
          backHomeHref="/en"
          backHomeLabel={messages.backHome}
          onRetry={reset}
        />
      </body>
    </html>
  );
}
