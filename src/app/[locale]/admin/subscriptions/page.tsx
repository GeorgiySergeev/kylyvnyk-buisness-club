import type { SupportedLocale } from '@/components/layout/navigation';
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '@/features/admin/components/admin-ui';
import { getT } from '@/lib/i18n/t-server';

interface AdminSubscriptionsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminSubscriptionsPage({ params }: AdminSubscriptionsPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description={t('subscriptionsDescription')}
        title={t('subscriptionsTitle')}
      />
      <AdminPanel
        description={t('subscriptionsPanelDescription')}
        title={t('subscriptionsPanelTitle')}
      >
        <AdminEmptyState
          description={t('subscriptionsEmptyDescription')}
          title={t('subscriptionsEmptyTitle')}
        />
      </AdminPanel>
    </div>
  );
}
