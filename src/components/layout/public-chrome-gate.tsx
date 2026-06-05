'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';

interface PublicChromeGateProps {
  children: ReactNode;
  locale: SupportedLocale;
}

export function PublicChromeGate({ children, locale }: PublicChromeGateProps) {
  const pathname = usePathname() ?? '';
  const isAdminRoute = pathname === `/${locale}/admin` || pathname.startsWith(`/${locale}/admin/`);

  if (isAdminRoute) {
    return null;
  }

  return <>{children}</>;
}
