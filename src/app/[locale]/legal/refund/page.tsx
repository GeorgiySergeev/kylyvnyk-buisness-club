import type { SupportedLocale } from '@/components/layout/navigation';
import { LegalPage } from '@/features/legal/components/legal-page';

interface RefundPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function RefundPage({ params }: RefundPageProps) {
  const { locale } = await params;

  return <LegalPage document="refund" locale={locale} />;
}
