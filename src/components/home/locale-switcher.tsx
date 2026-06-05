'use client';

import { Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from '@/components/layout/navigation';

const LOCALE_LABELS = {
  en: 'EN',
  ru: 'RU',
  uk: 'UK',
} as const;

export function LocaleSwitcher() {
  const pathname = usePathname() ?? '';
  const [, localeSegment] = pathname.split('/');
  const currentLocale = isSupportedLocale(localeSegment) ? localeSegment : DEFAULT_LOCALE;

  function getHref(locale: string) {
    if (isSupportedLocale(localeSegment)) {
      return pathname.replace(/^\/[^/]+/, `/${locale}`);
    }

    return `/${locale}${pathname === '/' ? '' : pathname}`;
  }

  return (
    <div
      className="flex min-h-11 items-center gap-1 rounded-ds-radius-md px-ds-space-1 text-ds-text-sm font-medium text-ds-text-muted"
      aria-label="Language"
    >
      <Globe className="size-4 text-ds-text-faint" strokeWidth={1.5} />
      {SUPPORTED_LOCALES.map((locale) => (
        <Link
          key={locale}
          href={getHref(locale)}
          aria-current={locale === currentLocale ? 'true' : undefined}
          className="rounded-ds-radius-sm px-1.5 py-1 text-ds-text-xs uppercase leading-4 transition-ds-transition-fast hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none aria-[current=true]:font-medium aria-[current=true]:text-ds-text"
        >
          {LOCALE_LABELS[locale]}
        </Link>
      ))}
    </div>
  );
}
