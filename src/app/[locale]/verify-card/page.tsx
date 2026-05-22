import type { Metadata } from 'next';

import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface VerifyCardPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function VerifyCardPage({ params }: VerifyCardPageProps) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      descriptionKey="verifyCardDescription"
      eyebrowKey="verifyCardEyebrow"
      locale={locale}
      primaryActionKey="verifyCardPrimaryAction"
      titleKey="verifyCardTitle"
    />
  );
}
