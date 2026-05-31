import type { ReactNode } from 'react';

import { DevRouteMenu } from '@/components/dev/dev-route-menu';
import { HomeHeader } from '@/components/home/home-header';
import type { AuthAction, NavItem, SupportedLocale } from '@/components/layout/navigation';

import { PublicChromeGate } from './public-chrome-gate';
import { SiteFooter } from './site-footer';

interface AppShellProps {
  children: ReactNode;
  locale: SupportedLocale;
  homeHref: string;
  navItems: NavItem[];
  isAuthenticated: boolean;
  displayName?: string;
  avatarUrl?: string;
  guestAuth: {
    signIn: AuthAction;
    joinNow: AuthAction;
  };
  memberAuth: {
    signOut: AuthAction;
  };
}

export async function AppShell({
  children,
  locale,
  homeHref,
  navItems,
  isAuthenticated,
  displayName,
  avatarUrl,
  guestAuth,
  memberAuth,
}: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-ds-bg text-ds-text">
      <PublicChromeGate locale={locale}>
        <HomeHeader
          homeHref={homeHref}
          navItems={navItems}
          isAuthenticated={isAuthenticated}
          displayName={displayName}
          avatarUrl={avatarUrl}
          guestAuth={guestAuth}
          memberAuth={memberAuth}
        />
      </PublicChromeGate>
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
      <PublicChromeGate locale={locale}>
        <DevRouteMenu locale={locale} />
      </PublicChromeGate>
      <PublicChromeGate locale={locale}>
        <SiteFooter locale={locale} />
      </PublicChromeGate>
    </div>
  );
}
