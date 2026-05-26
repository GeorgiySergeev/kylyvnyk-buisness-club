import 'server-only';

import type { SupportedLocale } from '@/components/layout/navigation';

import a11y from '../../../messages/en/a11y.json';
import admin from '../../../messages/en/admin.json';
import auth from '../../../messages/en/auth.json';
import cards from '../../../messages/en/cards.json';
import dashboard from '../../../messages/en/dashboard.json';
import directory from '../../../messages/en/directory.json';
import footer from '../../../messages/en/footer.json';
import home from '../../../messages/en/home.json';
import introductions from '../../../messages/en/introductions.json';
import nav from '../../../messages/en/nav.json';
import placeholders from '../../../messages/en/placeholders.json';
import a11yRu from '../../../messages/ru/a11y.json';
import adminRu from '../../../messages/ru/admin.json';
import authRu from '../../../messages/ru/auth.json';
import cardsRu from '../../../messages/ru/cards.json';
import dashboardRu from '../../../messages/ru/dashboard.json';
import directoryRu from '../../../messages/ru/directory.json';
import footerRu from '../../../messages/ru/footer.json';
import homeRu from '../../../messages/ru/home.json';
import introductionsRu from '../../../messages/ru/introductions.json';
import navRu from '../../../messages/ru/nav.json';
import placeholdersRu from '../../../messages/ru/placeholders.json';
import a11yUk from '../../../messages/uk/a11y.json';
import adminUk from '../../../messages/uk/admin.json';
import authUk from '../../../messages/uk/auth.json';
import cardsUk from '../../../messages/uk/cards.json';
import dashboardUk from '../../../messages/uk/dashboard.json';
import directoryUk from '../../../messages/uk/directory.json';
import footerUk from '../../../messages/uk/footer.json';
import homeUk from '../../../messages/uk/home.json';
import introductionsUk from '../../../messages/uk/introductions.json';
import navUk from '../../../messages/uk/nav.json';
import placeholdersUk from '../../../messages/uk/placeholders.json';

const EN_MESSAGES = {
  a11y,
  admin,
  auth,
  cards,
  dashboard,
  directory,
  footer,
  home,
  introductions,
  nav,
  placeholders,
} as const;

const MESSAGES_BY_LOCALE = {
  en: EN_MESSAGES,
  ru: {
    a11y: a11yRu,
    admin: adminRu,
    auth: authRu,
    cards: cardsRu,
    dashboard: dashboardRu,
    directory: directoryRu,
    footer: footerRu,
    home: homeRu,
    introductions: introductionsRu,
    nav: navRu,
    placeholders: placeholdersRu,
  },
  uk: {
    a11y: a11yUk,
    admin: adminUk,
    auth: authUk,
    cards: cardsUk,
    dashboard: dashboardUk,
    directory: directoryUk,
    footer: footerUk,
    home: homeUk,
    introductions: introductionsUk,
    nav: navUk,
    placeholders: placeholdersUk,
  },
} as const;

type Messages = typeof EN_MESSAGES;
type Namespace = keyof Messages;
export type Key<N extends Namespace> = keyof Messages[N] & string;

export function getT<N extends Namespace>(
  namespace: N,
  locale: SupportedLocale = 'en',
): (key: Key<N>) => string {
  const scopedMessages = MESSAGES_BY_LOCALE[locale][namespace] as Messages[N];

  return (key) => scopedMessages[key] as string;
}
