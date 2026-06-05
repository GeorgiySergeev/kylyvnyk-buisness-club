import { desc, isNull } from 'drizzle-orm';
import { BadgeCheck, Clock, Crown } from 'lucide-react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { memberships } from '@/db/schema';
import { AdminMetricCard, AdminPageHeader, AdminPanel } from '@/features/admin/components/admin-ui';
import { MembershipsCrud } from '@/features/admin/components/memberships-crud';
import { isUndefinedTableError, MIGRATION_REQUIRED_MESSAGE } from '@/lib/db-guard';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminMembershipsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminMembershipsPage({ params }: AdminMembershipsPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);

  let rows: Array<{
    endsAt: Date | null;
    id: string;
    planCode: string;
    startsAt: Date;
    status: string;
    userId: string;
  }> = [];
  let migrationRequired = false;

  try {
    rows = await db.query.memberships.findMany({
      columns: { endsAt: true, id: true, planCode: true, startsAt: true, status: true, userId: true },
      orderBy: [desc(memberships.createdAt)],
      where: isNull(memberships.deletedAt),
    });
  } catch (error) {
    if (isUndefinedTableError(error, 'memberships')) {
      migrationRequired = true;
    } else {
      throw error;
    }
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description={t('membershipsDescription')}
        eyebrow={t('navUsers')}
        title={t('navMemberships')}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminMetricCard
          icon={<BadgeCheck className="size-4" />}
          label={t('membershipsMetricTotal')}
          meta={t('liveDatabaseSnapshot')}
          value={rows.length}
        />
        <AdminMetricCard
          icon={<Crown className="size-4" />}
          label={t('membershipsMetricActive')}
          meta={t('liveDatabaseSnapshot')}
          tone="success"
          value={rows.filter((row) => row.status === 'ACTIVE').length}
        />
        <AdminMetricCard
          icon={<Clock className="size-4" />}
          label={t('membershipsMetricEnding')}
          meta={t('liveDatabaseSnapshot')}
          tone="warning"
          value={rows.filter((row) => row.endsAt).length}
        />
      </div>

      <AdminPanel description={t('membershipsPanelDescription')} title={t('membershipsPanelTitle')}>
        {migrationRequired ? (
          <p className="text-sm text-ds-warning">{MIGRATION_REQUIRED_MESSAGE}</p>
        ) : null}
        <MembershipsCrud
          disabled={migrationRequired}
          labels={{
            create: t('create'),
            disable: t('disable'),
            planCode: t('planCode'),
            save: t('saveShort'),
            status: t('status'),
            userId: t('userId'),
          }}
          rows={rows.map((row) => ({
            endsAt: row.endsAt ? row.endsAt.toISOString().slice(0, 16) : null,
            id: row.id,
            planCode: row.planCode,
            startsAt: row.startsAt.toISOString().slice(0, 16),
            status: row.status,
            userId: row.userId,
          }))}
        />
      </AdminPanel>
    </div>
  );
}
