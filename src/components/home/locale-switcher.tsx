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
  const pathname = usePathname();
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
      className="flex min-h-11 items-center gap-1 rounded-md px-1 text-sm font-medium text-fg/45"
      aria-label="Language"
    >
      <Globe className="size-4 text-fg/35" strokeWidth={1.5} />
      {SUPPORTED_LOCALES.map((locale) => (
        <Link
          key={locale}
          href={getHref(locale)}
          aria-current={locale === currentLocale ? 'true' : undefined}
          className="rounded px-1.5 py-1 text-xs uppercase leading-4 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=true]:font-medium aria-[current=true]:text-white"
        >
          {LOCALE_LABELS[locale]}
        </Link>
      ))}
    </div>
  );
}
