import type { SupportedLocale } from '@/components/layout/navigation';
import { LegalPage } from '@/features/legal/components/legal-page';

interface PrivacyPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;

  return <LegalPage document="privacy" locale={locale} />;
}
