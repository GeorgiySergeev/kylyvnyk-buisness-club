import { getNavigationSession } from '@/lib/auth/navigation-session';
import { getT } from '@/lib/i18n/t-server';

import { HeaderClient } from './header-client';
import {
  type AuthAction,
  GUEST_AUTH,
  MEMBER_AUTH,
  type NavItem,
  PRIMARY_NAV,
  type SupportedLocale,
  filterNavByRole,
  localizeHref,
} from './navigation';

function translateNavItems(locale: SupportedLocale, items: typeof PRIMARY_NAV): NavItem[] {
  const tNav = getT('nav');

  return items.map((item) => ({
    exact: item.exact,
    href: localizeHref(locale, item.href),
    key: item.key,
    label: tNav(item.key),
  }));
}

function translateAuthAction(
  locale: SupportedLocale,
  action:
    | (typeof GUEST_AUTH)[keyof typeof GUEST_AUTH]
    | (typeof MEMBER_AUTH)[keyof typeof MEMBER_AUTH],
): AuthAction {
  const tAuth = getT('auth');

  return {
    href: localizeHref(locale, action.href),
    label: tAuth(action.key),
  };
}

interface SiteHeaderProps {
  locale: SupportedLocale;
}

export async function SiteHeader({ locale }: SiteHeaderProps) {
  const session = await getNavigationSession();
  const navItems = translateNavItems(locale, filterNavByRole(PRIMARY_NAV, session.role));
  const tA11y = getT('a11y');
  const tFooter = getT('footer');

  return (
    <HeaderClient
      homeHref={localizeHref(locale, '/')}
      logoLabel={tFooter('logoShort')}
      navItems={navItems}
      session={session}
      guestAuth={{
        joinNow: translateAuthAction(locale, GUEST_AUTH.joinNow),
        signIn: translateAuthAction(locale, GUEST_AUTH.signIn),
      }}
      memberAuth={{
        signOut: translateAuthAction(locale, MEMBER_AUTH.signOut),
      }}
      ariaLabels={{
        closeMenu: tA11y('closeMenu'),
        mobileNavigation: tA11y('mobileNavigation'),
        openMenu: tA11y('openMenu'),
        primaryNavigation: tA11y('primaryNavigation'),
        userMenu: tA11y('userMenu'),
      }}
    />
  );
}
