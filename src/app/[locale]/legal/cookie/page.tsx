import type { SupportedLocale } from '@/components/layout/navigation';
import { LegalPage } from '@/features/legal/components/legal-page';
import { loadLegalMarkdownHtml } from '@/features/legal/lib/load-legal-markdown';

interface CookiePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function CookiePage({ params }: CookiePageProps) {
  const { locale } = await params;
  const contentHtml = await loadLegalMarkdownHtml('cookie', locale);

  return (
    <LegalPage
      contentHtml={contentHtml ?? undefined}
      document="cookie"
      locale={locale}
    />
  );
}
