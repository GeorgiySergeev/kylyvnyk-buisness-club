import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';

interface DirectoryPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function DirectoryPage({ params }: DirectoryPageProps) {
  const { locale } = await params;

  return (
    <PlaceholderPage
      descriptionKey="directoryDescription"
      eyebrowKey="directoryEyebrow"
      locale={locale}
      primaryActionKey="directoryPrimaryAction"
      titleKey="directoryTitle"
    />
  );
}
