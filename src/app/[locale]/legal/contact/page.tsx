import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

interface ContactPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      descriptionKey="contactDescription"
      eyebrowKey="contactEyebrow"
      locale={locale}
      primaryActionKey="contactPrimaryAction"
      titleKey="contactTitle"
    />
  );
}
