import type { SupportedLocale } from '@/components/layout/navigation';
import { LegalPage } from '@/features/legal/components/legal-page';

interface CookiePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function CookiePage({ params }: CookiePageProps) {
  const { locale } = await params;

  return <LegalPage document="cookie" locale={locale} />;
}
