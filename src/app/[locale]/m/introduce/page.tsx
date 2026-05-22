import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';
import { guardBusiness, guardOnboarded } from '@/features/auth/lib/role-guards';

export const dynamic = 'force-dynamic';

interface IntroducePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function IntroducePage({ params }: IntroducePageProps) {
  const { locale } = await params;
  await guardBusiness(locale);
  await guardOnboarded(locale);

  return (
    <PlaceholderPage
      descriptionKey="introduceDescription"
      eyebrowKey="introduceEyebrow"
      locale={locale}
      primaryActionKey="introducePrimaryAction"
      titleKey="introduceTitle"
    />
  );
}
