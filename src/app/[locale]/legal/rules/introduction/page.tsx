import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

interface IntroductionRulesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function IntroductionRulesPage({ params }: IntroductionRulesPageProps) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      descriptionKey="introductionRulesDescription"
      eyebrowKey="introductionRulesEyebrow"
      locale={locale}
      primaryActionKey="introductionRulesPrimaryAction"
      titleKey="introductionRulesTitle"
    />
  );
}
