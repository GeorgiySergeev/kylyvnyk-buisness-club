import type { SupportedLocale } from '@/components/layout/navigation';

import errorEn from '../../../messages/en/error.json';
import errorRu from '../../../messages/ru/error.json';
import errorUk from '../../../messages/uk/error.json';

const ERROR_MESSAGES = {
  en: errorEn,
  ru: errorRu,
  uk: errorUk,
} as const;

export type ErrorMessageKey = keyof typeof errorEn;

export function getErrorMessages(locale: SupportedLocale) {
  return ERROR_MESSAGES[locale] ?? ERROR_MESSAGES.en;
}

export function resolveLocaleFromPathname(pathname?: string | null): SupportedLocale {
  // If pathname is not provided (e.g., during build or in non-browser contexts),
  // default to English to avoid runtime crashes.
  if (!pathname || typeof pathname !== 'string') return 'en';

  const match = /^\/(en|ru|uk)(?:\/|$)/.exec(pathname);
  const locale = match?.[1];

  if (locale === 'ru' || locale === 'uk') {
    return locale;
  }

  return 'en';
}
