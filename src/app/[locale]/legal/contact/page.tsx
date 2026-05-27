import type { SupportedLocale } from '@/components/layout/navigation';
import { LegalPage } from '@/features/legal/components/legal-page';

interface ContactPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;

  return <LegalPage document="contact" locale={locale} />;
}
