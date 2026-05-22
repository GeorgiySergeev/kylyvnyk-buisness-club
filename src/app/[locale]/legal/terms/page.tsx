import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

interface TermsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      descriptionKey="termsDescription"
      eyebrowKey="termsEyebrow"
      locale={locale}
      primaryActionKey="termsPrimaryAction"
      titleKey="termsTitle"
    />
  );
}
