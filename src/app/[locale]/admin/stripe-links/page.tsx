import type { SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { AdminEmptyState, AdminPageHeader, AdminPanel } from '@/features/admin/components/admin-ui';
import { StripeLinksCrud } from '@/features/admin/components/stripe-links-crud';
import { MIGRATION_REQUIRED_MESSAGE, isUndefinedTableError } from '@/lib/db-guard';
import { getT } from '@/lib/i18n/t-server';

interface AdminStripeLinksPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminStripeLinksPage({ params }: AdminStripeLinksPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);
  let rows: Array<{
    code: string;
    id: string;
    paymentLinkUrl: string;
    status: string;
    title: string;
  }> = [];
  let migrationRequired = false;

  try {
    rows = await db.query.stripeLinks.findMany({
      columns: { code: true, id: true, paymentLinkUrl: true, status: true, title: true },
      orderBy: (stripeLinks, { desc }) => [desc(stripeLinks.createdAt)],
      where: (stripeLinks, { isNull }) => isNull(stripeLinks.deletedAt),
    });
  } catch (error) {
    if (isUndefinedTableError(error, 'stripe_links')) {
      migrationRequired = true;
    } else {
      throw error;
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader description={t('stripeLinksDescription')} title={t('stripeLinksTitle')} />
      <AdminPanel description={t('stripeLinksPanelDescription')} title={t('stripeLinksPanelTitle')}>
        {migrationRequired ? (
          <p className="text-sm text-amber-300">{MIGRATION_REQUIRED_MESSAGE}</p>
        ) : null}
        <StripeLinksCrud disabled={migrationRequired} rows={rows} />
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
