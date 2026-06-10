import type { SupportedLocale } from '@/components/layout/navigation';
import { LegalPage } from '@/features/legal/components/legal-page';
import { loadLegalMarkdownHtml } from '@/features/legal/lib/load-legal-markdown';

interface PrivacyPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const contentHtml = await loadLegalMarkdownHtml('privacy', locale);

  return (
    <LegalPage
      contentHtml={contentHtml ?? undefined}
      document="privacy"
      locale={locale}
    />
  );
}
