import type { SupportedLocale } from '@/components/layout/navigation';
import { LegalPage } from '@/features/legal/components/legal-page';

interface TermsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;

  return <LegalPage document="terms" locale={locale} />;
}
