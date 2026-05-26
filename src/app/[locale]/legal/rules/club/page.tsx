import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

interface ClubRulesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function ClubRulesPage({ params }: ClubRulesPageProps) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      descriptionKey="clubRulesDescription"
      eyebrowKey="clubRulesEyebrow"
      locale={locale}
      primaryActionKey="clubRulesPrimaryAction"
      titleKey="clubRulesTitle"
    />
  );
}
