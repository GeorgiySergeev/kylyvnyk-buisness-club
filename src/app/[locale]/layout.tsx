import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import {
  type AuthAction,
  filterNavByRole,
  GUEST_AUTH,
  localizeHref,
  MEMBER_AUTH,
  type NavItem,
  PRIMARY_NAV,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@/components/layout/navigation';
import { getNavigationSession } from '@/lib/auth/navigation-session';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

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
  action: typeof GUEST_AUTH.signIn | typeof GUEST_AUTH.joinNow | typeof MEMBER_AUTH.signOut,
): AuthAction {
  const tAuth = getT('auth');
  return {
    href: localizeHref(locale, action.href),
    label: tAuth(action.key),
  };
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
    notFound();
  }

  const supportedLocale = locale as SupportedLocale;
  const session = await getNavigationSession();
  const navItems = translateNavItems(supportedLocale, filterNavByRole(PRIMARY_NAV, session.role));

  return (
    <AppShell
      locale={supportedLocale}
      homeHref={localizeHref(supportedLocale, '/')}
      navItems={navItems}
      isAuthenticated={session.role !== 'guest'}
      displayName={session.displayName}
      avatarUrl={session.avatarUrl}
      guestAuth={{
        signIn: translateAuthAction(supportedLocale, GUEST_AUTH.signIn),
        joinNow: translateAuthAction(supportedLocale, GUEST_AUTH.joinNow),
      }}
      memberAuth={{
        signOut: translateAuthAction(supportedLocale, MEMBER_AUTH.signOut),
      }}
    >
      {children}
    </AppShell>
  );
}
