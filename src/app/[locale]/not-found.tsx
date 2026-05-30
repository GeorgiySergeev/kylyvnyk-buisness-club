import { headers } from 'next/headers';
import Link from 'next/link';

import {
  DEFAULT_LOCALE,
  localizeHref,
  type SupportedLocale,
} from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { getT } from '@/lib/i18n/t-server';

function resolveLocale(value: string | null): SupportedLocale {
  if (value === 'ru' || value === 'uk' || value === 'en') {
    return value;
  }

  return DEFAULT_LOCALE;
}

export default async function LocaleNotFound() {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get('x-locale'));
  const t = getT('error', locale);

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-6 px-4 py-16 text-center"
    >
      <div className="space-y-3">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {t('notFoundTitle')}
        </h1>
        <p className="text-sm leading-relaxed text-fg/60 sm:text-base">{t('notFoundDescription')}</p>
      </div>

      <Button asChild variant="outline">
        <Link href={localizeHref(locale, '/')}>{t('notFoundBackHome')}</Link>
      </Button>
    </main>
  );
}
