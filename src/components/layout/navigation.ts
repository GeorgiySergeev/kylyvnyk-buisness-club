export const SUPPORTED_LOCALES = ['en'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type SessionRole = 'guest' | 'FREE' | 'VIP' | 'BUSINESS' | 'ADMIN';

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
    roles: ['guest', 'FREE', 'BUSINESS', 'ADMIN'],
  },
  {
    key: 'verifyCard',
    href: '/verify-card',
    roles: ['guest'],
  },
  {
    key: 'dashboard',
    href: '/m/dashboard',
    roles: ['FREE', 'BUSINESS', 'ADMIN'],
  },
  {
    key: 'recommendClient',
    href: '/m/introduce',
    roles: ['BUSINESS', 'ADMIN'],
  },
  {
    key: 'admin',
    href: '/admin',
    roles: ['ADMIN'],
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

export function filterNavByRole(items: NavItemConfig[], role: SessionRole): NavItemConfig[] {
  return items.filter((item) => item.roles.includes(role));
}
