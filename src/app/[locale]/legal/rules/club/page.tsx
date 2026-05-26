import type { SupportedLocale } from '@/components/layout/navigation';
import { LegalPage } from '@/features/legal/components/legal-page';

interface ClubRulesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function ClubRulesPage({ params }: ClubRulesPageProps) {
  const { locale } = await params;

  return <LegalPage document="clubRules" locale={locale} />;
}
