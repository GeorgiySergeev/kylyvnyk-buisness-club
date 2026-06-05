import { desc } from 'drizzle-orm';
import { CheckCircle2, Clock, RefreshCcw } from 'lucide-react';

import type { SupportedLocale } from '@/components/layout/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { db } from '@/db/client';
import { stripeSubscriptions } from '@/db/schema';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminMetricCard,
  AdminMobileCard,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { isUndefinedTableError, MIGRATION_REQUIRED_MESSAGE } from '@/lib/db-guard';
import { getT } from '@/lib/i18n/t-server';

interface AdminSubscriptionsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminSubscriptionsPage({ params }: AdminSubscriptionsPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);
  let rows: Array<{
    cancelAtPeriodEnd: boolean;
    createdAt: Date;
    currentPeriodEnd: Date | null;
    id: string;
    status: string;
    stripeSubscriptionId: string;
    userId: string | null;
  }> = [];
  let migrationRequired = false;

  try {
    rows = await db.query.stripeSubscriptions.findMany({
      columns: {
        cancelAtPeriodEnd: true,
        createdAt: true,
        currentPeriodEnd: true,
        id: true,
        status: true,
        stripeSubscriptionId: true,
        userId: true,
      },
      orderBy: [desc(stripeSubscriptions.createdAt)],
      limit: 200,
    });
  } catch (error) {
    if (isUndefinedTableError(error, 'stripe_subscriptions')) {
      migrationRequired = true;
    } else {
      throw error;
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description={t('subscriptionsDescription')}
        eyebrow={t('navMemberships')}
        title={t('subscriptionsTitle')}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminMetricCard
          icon={<RefreshCcw className="size-4" />}
          label={t('subscriptionsMetricTotal')}
          meta={t('liveDatabaseSnapshot')}
          value={rows.length}
        />
        <AdminMetricCard
          icon={<CheckCircle2 className="size-4" />}
          label={t('subscriptionsMetricActive')}
          meta={t('liveDatabaseSnapshot')}
          tone="success"
          value={rows.filter((row) => row.status === 'active' || row.status === 'ACTIVE').length}
        />
        <AdminMetricCard
          icon={<Clock className="size-4" />}
          label={t('subscriptionsMetricCanceling')}
          meta={t('liveDatabaseSnapshot')}
          tone="warning"
          value={rows.filter((row) => row.cancelAtPeriodEnd).length}
        />
      </div>

      <AdminPanel
        description={t('subscriptionsPanelDescription')}
        title={t('subscriptionsPanelTitle')}
      >
        {migrationRequired ? (
          <p className="text-sm text-ds-warning">{MIGRATION_REQUIRED_MESSAGE}</p>
        ) : null}
        {rows.length === 0 ? (
          <AdminEmptyState
            description={t('subscriptionsEmptyDescription')}
            title={t('subscriptionsEmptyTitle')}
          />
        ) : (
          <>
            {/* Mobile card view */}
            <div className="space-y-3 md:hidden">
              {rows.map((row) => (
                <AdminMobileCard
                  key={row.id}
                  title={<span className="font-mono text-xs">{row.stripeSubscriptionId}</span>}
                  badge={<AdminStatusBadge>{row.status}</AdminStatusBadge>}
                  rows={[
                    { label: t('userId'), value: <span className="font-mono text-xs">{row.userId ?? t('notDefined')}</span> },
                    {
                      label: t('currentPeriodEnd'),
                      value: row.currentPeriodEnd ? row.currentPeriodEnd.toLocaleString() : t('notDefined'),
                    },
                    { label: t('cancelAtPeriodEnd'), value: row.cancelAtPeriodEnd ? t('booleanTrue') : t('booleanFalse') },
                    {
                      label: t('created'),
                      value: row.createdAt.toLocaleString(),
                    },
                  ]}
                />
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block">
              <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-0 bg-ds-surface-2/70 hover:bg-ds-surface-2/70">
                    <TableHead className="text-ds-text-muted">{t('stripeId')}</TableHead>
                    <TableHead className="text-ds-text-muted">{t('status')}</TableHead>
                    <TableHead className="text-ds-text-muted">{t('userId')}</TableHead>
                    <TableHead className="text-ds-text-muted">{t('currentPeriodEnd')}</TableHead>
                    <TableHead className="text-ds-text-muted">{t('cancelAtPeriodEnd')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow className="border-ds-border" key={row.id}>
                      <TableCell className="font-mono text-xs">{row.stripeSubscriptionId}</TableCell>
                      <TableCell><AdminStatusBadge>{row.status}</AdminStatusBadge></TableCell>
                      <TableCell className="font-mono text-xs text-ds-text-muted">{row.userId ?? t('notDefined')}</TableCell>
                      <TableCell className="text-xs text-ds-text-muted">
                        {row.currentPeriodEnd ? row.currentPeriodEnd.toLocaleString() : t('notDefined')}
                      </TableCell>
                      <TableCell className="text-ds-text-muted">
                        {row.cancelAtPeriodEnd ? t('booleanTrue') : t('booleanFalse')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </AdminDataTableShell>
            </div>
          </>
        )}
      </AdminPanel>
    </div>
  );
}
