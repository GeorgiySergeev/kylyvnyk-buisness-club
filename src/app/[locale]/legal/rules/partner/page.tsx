import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

interface PartnerRulesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function PartnerRulesPage({ params }: PartnerRulesPageProps) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      descriptionKey="partnerRulesDescription"
      eyebrowKey="partnerRulesEyebrow"
      locale={locale}
      primaryActionKey="partnerRulesPrimaryAction"
      titleKey="partnerRulesTitle"
    />
  );
}
