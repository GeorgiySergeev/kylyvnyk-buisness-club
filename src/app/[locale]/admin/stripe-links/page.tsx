import type { SupportedLocale } from '@/components/layout/navigation';
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '@/features/admin/components/admin-ui';
import { getT } from '@/lib/i18n/t-server';

interface AdminStripeLinksPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminStripeLinksPage({ params }: AdminStripeLinksPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);

  return (
    <div className="space-y-5">
      <AdminPageHeader description={t('stripeLinksDescription')} title={t('stripeLinksTitle')} />
      <AdminPanel description={t('stripeLinksPanelDescription')} title={t('stripeLinksPanelTitle')}>
        <AdminEmptyState
          description={t('stripeLinksEmptyDescription')}
          title={t('stripeLinksEmptyTitle')}
        />
      </AdminPanel>
    </div>
  );
}
