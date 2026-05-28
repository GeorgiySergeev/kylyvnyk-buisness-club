import { count, eq, isNull } from 'drizzle-orm';
import { Building2, CreditCard, Gauge, Users } from 'lucide-react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { businesses, clubCards, users } from '@/db/schema';
import { AdminMetricCard, AdminPageHeader, AdminPanel } from '@/features/admin/components/admin-ui';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);

  const [userCount] = await db
    .select({ value: count() })
    .from(users)
    .where(isNull(users.deletedAt));

  const [businessCount] = await db
    .select({ value: count() })
    .from(businesses)
    .where(isNull(businesses.deletedAt));

  const [pendingBusinessCount] = await db
    .select({ value: count() })
    .from(businesses)
    .where(eq(businesses.status, 'PENDING'));

  const [activeCardCount] = await db
    .select({ value: count() })
    .from(clubCards)
    .where(eq(clubCards.status, 'ACTIVE'));

  const metrics = [
    { icon: <Users className="size-4" />, label: t('statUsers'), value: userCount!.value },
    {
      icon: <Building2 className="size-4" />,
      label: t('statBusinesses'),
      value: businessCount!.value,
    },
    {
      icon: <Gauge className="size-4" />,
      label: t('statPendingBusinesses'),
      tone: 'warning' as const,
      value: pendingBusinessCount!.value,
    },
    {
      icon: <CreditCard className="size-4" />,
      label: t('statActiveCards'),
      tone: 'success' as const,
      value: activeCardCount!.value,
    },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description={t('dashboardDescription')}
        eyebrow={t('backOffice')}
        title={t('dashboardTitle')}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((stat) => (
          <AdminMetricCard
            icon={stat.icon}
            key={stat.label}
            label={stat.label}
            meta={t('liveDatabaseSnapshot')}
            tone={stat.tone}
            value={stat.value}
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
        <AdminPanel description={t('operationsDescription')} title={t('operationsTitle')}>
          <div className="h-64 rounded-md border border-dashed border-border/80 bg-background/40" />
        </AdminPanel>
        <AdminPanel description={t('reviewQueueDescription')} title={t('reviewQueueTitle')}>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md border border-border/80 bg-background/40 px-3 py-2">
              <span className="text-muted-foreground">{t('statPendingBusinesses')}</span>
              <span className="font-semibold text-foreground">{pendingBusinessCount!.value}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-border/80 bg-background/40 px-3 py-2">
              <span className="text-muted-foreground">{t('statActiveCards')}</span>
              <span className="font-semibold text-foreground">{activeCardCount!.value}</span>
            </div>
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}
