import { desc } from 'drizzle-orm';

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
  AdminEmptyState,
  AdminMobileCard,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { isUndefinedTableError,MIGRATION_REQUIRED_MESSAGE } from '@/lib/db-guard';
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
        title={t('subscriptionsTitle')}
      />
      <AdminPanel
        description={t('subscriptionsPanelDescription')}
        title={t('subscriptionsPanelTitle')}
      >
        {migrationRequired ? (
          <p className="text-sm text-amber-300">{MIGRATION_REQUIRED_MESSAGE}</p>
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
                    { label: 'User ID', value: <span className="font-mono text-xs">{row.userId ?? 'N/A'}</span> },
                    {
                      label: 'Period End',
                      value: row.currentPeriodEnd ? row.currentPeriodEnd.toLocaleString() : 'N/A',
                    },
                    { label: 'Cancel at end', value: row.cancelAtPeriodEnd ? 'true' : 'false' },
                    {
                      label: 'Created',
                      value: row.createdAt.toLocaleString(),
                    },
                  ]}
                />
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-hidden rounded-md border border-border/80 bg-card/95">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Stripe ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Current Period End</TableHead>
                    <TableHead>Cancel at period end</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs">{row.stripeSubscriptionId}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell className="font-mono text-xs">{row.userId ?? 'N/A'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {row.currentPeriodEnd ? row.currentPeriodEnd.toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>{row.cancelAtPeriodEnd ? 'true' : 'false'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </AdminPanel>
    </div>
  );
}
