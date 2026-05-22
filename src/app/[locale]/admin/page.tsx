import type { SupportedLocale } from '@/components/layout/navigation';
import { PlaceholderPage } from '@/components/layout/placeholder-page';
import { guardAdmin } from '@/features/auth/lib/role-guards';

export const dynamic = 'force-dynamic';

interface AdminPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  await guardAdmin(locale);

  return (
    <PlaceholderPage
      descriptionKey="adminDescription"
      eyebrowKey="adminEyebrow"
      locale={locale}
      primaryActionKey="adminPrimaryAction"
      titleKey="adminTitle"
    />
  );
}
