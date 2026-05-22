import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';
import { guardOnboarded } from '@/features/auth/lib/role-guards';

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  await guardOnboarded(locale);

  return (
    <PlaceholderPage
      descriptionKey="dashboardDescription"
      eyebrowKey="dashboardEyebrow"
      locale={locale}
      primaryActionKey="dashboardPrimaryAction"
      titleKey="dashboardTitle"
    />
  );
}
