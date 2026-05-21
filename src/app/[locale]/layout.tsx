import type { ReactNode } from 'react';

import { notFound } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/components/layout/navigation';

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
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

  return <AppShell locale={locale as SupportedLocale}>{children}</AppShell>;
}
