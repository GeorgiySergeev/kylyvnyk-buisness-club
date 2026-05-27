export const SUPPORTED_LOCALES = ['en', 'ru', 'uk'] as const;
export const DEFAULT_LOCALE: SupportedLocale = 'en';

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type SessionRole = 'guest' | 'MEMBER' | 'MANAGER' | 'ADMIN' | 'OWNER';

export interface NavItemConfig {
  key: 'directory' | 'verifyCard' | 'dashboard' | 'recommendClient' | 'admin';
  href: string;
  roles: SessionRole[];
  exact?: boolean;
}

export interface NavItem {
  key: NavItemConfig['key'];
  href: string;
  label: string;
  exact?: boolean;
}

export interface AuthActionConfig {
  key: 'signIn' | 'joinNow' | 'signOut';
  href: string;
}

export interface AuthAction {
  href: string;
  label: string;
}

export const PRIMARY_NAV: NavItemConfig[] = [
  {
    key: 'directory',
    href: '/directory',
    roles: ['guest', 'MEMBER', 'MANAGER', 'ADMIN', 'OWNER'],
  },
  {
    key: 'verifyCard',
    href: '/verify-card',
    roles: ['guest'],
  },
  {
    key: 'dashboard',
    href: '/m/dashboard',
    roles: ['MEMBER', 'MANAGER', 'ADMIN', 'OWNER'],
  },
  {
    key: 'recommendClient',
    href: '/m/introduce',
    roles: ['MEMBER', 'MANAGER', 'ADMIN', 'OWNER'],
  },
  {
    key: 'admin',
    href: '/admin',
    roles: ['ADMIN', 'OWNER'],
  },
];

export const GUEST_AUTH: Record<'signIn' | 'joinNow', AuthActionConfig> = {
  signIn: {
    key: 'signIn',
    href: '/sign-in',
  },
  joinNow: {
    key: 'joinNow',
    href: '/sign-up',
  },
};

export const MEMBER_AUTH: Record<'signOut', AuthActionConfig> = {
  signOut: {
    key: 'signOut',
    href: '/sign-out',
  },
};

export function localizeHref(locale: SupportedLocale, href: string): string {
  if (href === '/') {
    return `/${locale}`;
  }

  return `/${locale}${href}`;
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function resolveLocale(locale: string | undefined): SupportedLocale {
  return locale && isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}

export function filterNavByRole(items: NavItemConfig[], role: SessionRole): NavItemConfig[] {
  return items.filter((item) => item.roles.includes(role));
}
