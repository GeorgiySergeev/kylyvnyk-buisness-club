import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

interface CookiePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function CookiePage({ params }: CookiePageProps) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      descriptionKey="cookieDescription"
      eyebrowKey="cookieEyebrow"
      locale={locale}
      primaryActionKey="cookiePrimaryAction"
      titleKey="cookieTitle"
    />
  );
}
