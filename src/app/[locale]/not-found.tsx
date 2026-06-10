import { FileX2 } from 'lucide-react';
import Link from 'next/link';

import {
  DEFAULT_LOCALE,
  localizeHref,
  type SupportedLocale,
} from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { getT } from '@/lib/i18n/t-server';

interface LocaleNotFoundProps {
  params?: Promise<{
    locale?: string;
  }>;
}

export default async function LocaleNotFound({ params }: LocaleNotFoundProps) {
  let locale: SupportedLocale = DEFAULT_LOCALE;

  if (params) {
    try {
      const resolvedParams = await params;
      if (resolvedParams?.locale === 'ru' || resolvedParams?.locale === 'uk' || resolvedParams?.locale === 'en') {
        locale = resolvedParams.locale;
      }
    } catch {
      // Fallback to DEFAULT_LOCALE
    }
  }

  const t = getT('error', locale);

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-8 px-4 py-16 text-center"
    >
      {/* Icon */}
      <div className="flex size-16 items-center justify-center rounded-full border border-ds-border bg-ds-surface-hover">
        <FileX2 aria-hidden="true" className="size-7 text-ds-text-muted" strokeWidth={1.5} />
      </div>

      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ds-text-faint">
          404
        </p>
        <h1 className="text-ds-display-3 font-bold tracking-tight text-ds-text">
          {t('notFoundTitle')}
        </h1>
        <p className="max-w-prose text-ds-text-sm leading-relaxed text-ds-text-muted sm:text-ds-text-base">
          {t('notFoundDescription')}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href={localizeHref(locale, '/')}>{t('notFoundBackHome')}</Link>
        </Button>
        <Button asChild variant="outline">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="javascript:history.back()">{t('goBack')}</a>
        </Button>
      </div>
    </main>
  );
}

