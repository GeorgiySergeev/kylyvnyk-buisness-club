import type { SupportedLocale } from '@/components/layout/navigation';
import { LegalPage } from '@/features/legal/components/legal-page';

interface IntroductionRulesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function IntroductionRulesPage({ params }: IntroductionRulesPageProps) {
  const { locale } = await params;

  return <LegalPage document="introductionRules" locale={locale} />;
}
