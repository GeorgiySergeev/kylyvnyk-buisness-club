import type { ReactNode } from 'react';

import { ClerkProvider } from '@clerk/nextjs';
import { notFound } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/components/layout/navigation';

export const dynamic = 'force-dynamic';

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

  const supportedLocale = locale as SupportedLocale;

  return (
    <ClerkProvider
      afterSignInUrl={`/${supportedLocale}/m/dashboard`}
      afterSignUpUrl={`/${supportedLocale}/m/onboarding`}
      signInUrl={`/${supportedLocale}/sign-in`}
      signUpUrl={`/${supportedLocale}/sign-up`}
    >
      <AppShell locale={supportedLocale}>{children}</AppShell>
    </ClerkProvider>
  );
}
