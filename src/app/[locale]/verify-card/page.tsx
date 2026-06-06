import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';
import { VERIFY_CARD_METADATA } from '@/features/cards/lib/verify-card-metadata';

export const metadata = VERIFY_CARD_METADATA;

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
