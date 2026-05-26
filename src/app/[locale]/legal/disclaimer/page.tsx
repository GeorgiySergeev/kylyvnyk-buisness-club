import type { SupportedLocale } from '@/components/layout/navigation';
import { LegalPage } from '@/features/legal/components/legal-page';

interface DisclaimerPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function DisclaimerPage({ params }: DisclaimerPageProps) {
  const { locale } = await params;

  return <LegalPage document="disclaimer" locale={locale} />;
}
