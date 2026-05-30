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

export function resolveLocaleFromPathname(pathname: string): SupportedLocale {
  const match = /^\/(en|ru|uk)(?:\/|$)/.exec(pathname);

  if (match?.[1] === 'ru' || match?.[1] === 'uk') {
    return match[1];
  }

  return 'en';
}
