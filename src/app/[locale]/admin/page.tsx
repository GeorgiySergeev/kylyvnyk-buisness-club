import { count, desc, eq, inArray, isNull } from 'drizzle-orm';
import { ArrowUpRight, Building2, CreditCard, Gauge, MessageSquare, Users } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { businesses, clubCards, introductions, users } from '@/db/schema';
import {
  AdminMetricCard,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
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

  const [
    [userCount],
    [businessCount],
    [pendingBusinessCount],
    [activeCardCount],
    [pendingIntroductionCount],
    recentUsers,
  ] = await Promise.all([
    db.select({ value: count() }).from(users).where(isNull(users.deletedAt)),
    db.select({ value: count() }).from(businesses).where(isNull(businesses.deletedAt)),
    db.select({ value: count() }).from(businesses).where(eq(businesses.status, 'PENDING')),
    db.select({ value: count() }).from(clubCards).where(eq(clubCards.status, 'ACTIVE')),
    db
      .select({ value: count() })
      .from(introductions)
      .where(inArray(introductions.status, ['SUBMITTED', 'UNDER_REVIEW'])),
    db
      .select({
        createdAt: users.createdAt,
        displayName: users.displayName,
        id: users.id,
        phone: users.phone,
        status: users.status,
      })
      .from(users)
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.createdAt))
      .limit(5),
  ]);

  const metrics = [
    {
      href: localizeHref(locale, '/admin/users'),
      icon: <Users className="size-4" />,
      label: t('statUsers'),
      value: userCount!.value,
    },
    {
      href: localizeHref(locale, '/admin/businesses'),
      icon: <Building2 className="size-4" />,
      label: t('statBusinesses'),
      value: businessCount!.value,
    },
    {
      href: localizeHref(locale, '/admin/businesses'),
      icon: <Gauge className="size-4" />,
      label: t('statPendingBusinesses'),
      tone: 'warning' as const,
      value: pendingBusinessCount!.value,
    },
    {
      href: localizeHref(locale, '/admin/cards'),
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
            href={stat.href}
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
        <AdminPanel description={t('recentUsersDescription')} title={t('recentUsersTitle')}>
          <div className="divide-y divide-ds-border">
            {recentUsers.map((user) => (
              <Link
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                href={localizeHref(locale, `/admin/users/${user.id}`)}
                key={user.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ds-text">
                    {user.displayName ?? user.phone}
                  </p>
                  <p className="mt-0.5 text-xs text-ds-text-muted">
                    {user.createdAt.toLocaleDateString(locale)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <AdminStatusBadge>{user.status}</AdminStatusBadge>
                  <ArrowUpRight className="size-4 text-ds-text-faint" />
                </div>
              </Link>
            ))}
          </div>
        </AdminPanel>
        <AdminPanel description={t('reviewQueueDescription')} title={t('reviewQueueTitle')}>
          <div className="space-y-2">
            <ReviewQueueLink
              count={pendingBusinessCount!.value}
              href={localizeHref(locale, '/admin/businesses')}
              icon={<Building2 className="size-4" />}
              label={t('statPendingBusinesses')}
            />
            <ReviewQueueLink
              count={pendingIntroductionCount!.value}
              href={localizeHref(locale, '/admin/introductions')}
              icon={<MessageSquare className="size-4" />}
              label={t('introductionsTitle')}
            />
            <ReviewQueueLink
              count={activeCardCount!.value}
              href={localizeHref(locale, '/admin/cards')}
              icon={<CreditCard className="size-4" />}
              label={t('statActiveCards')}
            />
          </div>
        </AdminPanel>
      </div>
    </div>
  );
}

function ReviewQueueLink({
  count: value,
  href,
  icon,
  label,
}: {
  count: number;
  href: string;
  icon: ReactNode;
  label: string;
}) {
  return (
    <Link
      className="flex items-center gap-3 rounded-ds-radius-md border border-ds-border bg-ds-bg px-3 py-3 transition-colors hover:bg-ds-surface-2"
      href={href}
    >
      <span className="flex size-8 items-center justify-center rounded-ds-radius-md border border-ds-border bg-ds-surface text-ds-text-muted">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-ds-text-muted">{label}</span>
      <span className="font-mono text-sm font-semibold text-ds-text">{value}</span>
      <ArrowUpRight className="size-4 text-ds-text-faint" />
    </Link>
  );
}
