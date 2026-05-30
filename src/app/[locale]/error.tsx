'use client';

import * as Sentry from '@sentry/nextjs';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { ErrorFallback } from '@/components/error/error-fallback';
import { localizeHref } from '@/components/layout/navigation';
import { getErrorMessages, resolveLocaleFromPathname } from '@/lib/i18n/error-messages';

export interface LocaleErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: LocaleErrorProps) {
  const pathname = usePathname();
  const locale = resolveLocaleFromPathname(pathname);
  const messages = getErrorMessages(locale);

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <ErrorFallback
      title={messages.title}
      description={messages.description}
      retryLabel={messages.retry}
      backHomeHref={localizeHref(locale, '/')}
      backHomeLabel={messages.backHome}
      onRetry={reset}
    />
  );
}
