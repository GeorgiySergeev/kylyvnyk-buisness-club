import { ClerkProvider } from '@clerk/nextjs';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/components/layout/navigation';
import { loadMessages } from '@/i18n/request';

const clerkAppearance = {
  variables: {
    colorBackground: 'var(--color-surface)',
    colorInputBackground: 'var(--color-surface-2)',
    colorInputText: 'var(--color-fg)',
    colorPrimary: 'var(--color-accent)',
    colorText: 'var(--color-fg)',
  },
} as const;

function getSkipToContentLabel(messages: Record<string, unknown>): string {
  const a11y = messages.a11y;

  if (
    a11y &&
    typeof a11y === 'object' &&
    'skipToContent' in a11y &&
    typeof a11y.skipToContent === 'string'
  ) {
    return a11y.skipToContent;
  }

  return '';
}

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

  const messages = await loadMessages(locale);
  const skipToContentLabel = getSkipToContentLabel(messages);

  return (
    <ClerkProvider appearance={clerkAppearance}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-100 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:outline-2 focus:outline-offset-2 focus:outline-ring"
        >
          {skipToContentLabel}
        </a>
        <AppShell locale={locale as SupportedLocale}>{children}</AppShell>
      </NextIntlClientProvider>
    </ClerkProvider>
  );
}
