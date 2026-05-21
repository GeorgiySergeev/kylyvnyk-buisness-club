import type { ReactNode } from 'react';

import type { SupportedLocale } from './navigation';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './site-header';

interface AppShellProps {
  children: ReactNode;
  locale: SupportedLocale;
}

export async function AppShell({ children, locale }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader locale={locale} />
      <main id="main-content" className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter locale={locale} />
    </div>
  );
}
