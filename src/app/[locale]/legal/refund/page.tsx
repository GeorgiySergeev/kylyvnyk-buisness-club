import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

interface RefundPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function RefundPage({ params }: RefundPageProps) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      descriptionKey="refundDescription"
      eyebrowKey="refundEyebrow"
      locale={locale}
      primaryActionKey="refundPrimaryAction"
      titleKey="refundTitle"
    />
  );
}
