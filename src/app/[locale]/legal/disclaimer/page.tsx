import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

interface DisclaimerPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function DisclaimerPage({ params }: DisclaimerPageProps) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      descriptionKey="disclaimerDescription"
      eyebrowKey="disclaimerEyebrow"
      locale={locale}
      primaryActionKey="disclaimerPrimaryAction"
      titleKey="disclaimerTitle"
    />
  );
}
