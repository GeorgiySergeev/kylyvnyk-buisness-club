import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

interface PrivacyPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      descriptionKey="privacyDescription"
      eyebrowKey="privacyEyebrow"
      locale={locale}
      primaryActionKey="privacyPrimaryAction"
      titleKey="privacyTitle"
    />
  );
}
