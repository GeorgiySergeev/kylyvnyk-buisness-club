import type { SupportedLocale } from '@/components/layout/navigation';
import { LegalPage } from '@/features/legal/components/legal-page';

interface PartnerRulesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function PartnerRulesPage({ params }: PartnerRulesPageProps) {
  const { locale } = await params;

  return <LegalPage document="partnerRules" locale={locale} />;
}
