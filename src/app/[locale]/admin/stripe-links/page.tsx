import type { SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '@/features/admin/components/admin-ui';
import { StripeLinksCrud } from '@/features/admin/components/stripe-links-crud';
import { getT } from '@/lib/i18n/t-server';

interface AdminStripeLinksPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminStripeLinksPage({ params }: AdminStripeLinksPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);
  const rows = await db.query.stripeLinks.findMany({
    columns: { code: true, id: true, paymentLinkUrl: true, status: true, title: true },
    orderBy: (stripeLinks, { desc }) => [desc(stripeLinks.createdAt)],
    where: (stripeLinks, { isNull }) => isNull(stripeLinks.deletedAt),
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader description={t('stripeLinksDescription')} title={t('stripeLinksTitle')} />
      <AdminPanel description={t('stripeLinksPanelDescription')} title={t('stripeLinksPanelTitle')}>
        <StripeLinksCrud rows={rows} />
        {rows.length === 0 ? (
          <AdminEmptyState
            description={t('stripeLinksEmptyDescription')}
            title={t('stripeLinksEmptyTitle')}
          />
        ) : null}
      </AdminPanel>
    </div>
  );
}
