import { desc } from 'drizzle-orm';
import { CreditCard, Eye, Filter, ShieldCheck, Timer } from 'lucide-react';
import Link from 'next/link';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { db } from '@/db/client';
import { clubCards } from '@/db/schema';
import { AdminRowActions } from '@/features/admin/components/admin-row-actions';
import {
  AdminTableActionsCell,
  AdminTableActionsHead,
} from '@/features/admin/components/admin-table-actions';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminFiltersBar,
  AdminMetricCard,
  AdminMobileCard,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminCardsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
}

export default async function AdminCardsPage({ params, searchParams }: AdminCardsPageProps) {
  const { locale } = await params;
  const { q, status } = await searchParams;
  const t = getT('admin', locale);

  const searchTerm = q?.trim() ?? '';
  const statusFilter = status?.trim() ?? '';

  type CardRow = {
    createdAt: Date;
    expiresAt: Date | null;
    id: string;
    memberType: string;
    number: string;
    status: string;
    user: { displayName: string | null; email: string | null; id: string; phone: string };
  };

  const allCards: CardRow[] = await db.query.clubCards.findMany({
    columns: {
      createdAt: true,
      expiresAt: true,
      id: true,
      memberType: true,
      number: true,
      status: true,
    },
    orderBy: [desc(clubCards.createdAt)],
    with: {
      user: {
        columns: {
          displayName: true,
          email: true,
          id: true,
          phone: true,
        },
      },
    },
  });

  let filtered = allCards;

  if (statusFilter) {
    filtered = filtered.filter((card) => card.status === statusFilter);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (card) =>
        card.number.toLowerCase().includes(term) ||
        card.user.displayName?.toLowerCase().includes(term) ||
        card.user.phone.toLowerCase().includes(term),
    );
  }

  const statuses = ['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED', 'ARCHIVED'] as const;
  const activeCount = allCards.filter((card) => card.status === 'ACTIVE').length;
  const vipCount = allCards.filter((card) => card.memberType === 'VIP').length;
  const expiringCount = allCards.filter((card) => {
    if (!card.expiresAt) return false;
    const daysUntilExpiry = (card.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  }).length;

  return (
    <div className="space-y-5">
      <AdminPageHeader description={t('cardsDescription')} title={t('cardsTitle')} />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminMetricCard
          icon={<ShieldCheck className="size-4" />}
          label={t('cardsMetricActive')}
          tone="success"
          value={activeCount}
        />
        <AdminMetricCard
          icon={<CreditCard className="size-4" />}
          label={t('cardsMetricVip')}
          value={vipCount}
        />
        <AdminMetricCard
          icon={<Timer className="size-4" />}
          label={t('cardsMetricExpiring')}
          tone="warning"
          value={expiringCount}
        />
      </div>

      <div className="flex items-center gap-2 text-ds-text-sm font-medium text-ds-text">
        <Filter aria-hidden="true" className="size-4 text-ds-text-muted" />
        {t('cardsDirectory')}
        <span className="text-ds-text-muted">({filtered.length.toLocaleString()})</span>
      </div>

      <AdminFiltersBar>
        <form className="flex w-full gap-2 sm:max-w-md" method="GET">
          <AdminSearchInput name="q" placeholder={t('cardNumber')} value={searchTerm} />
          {statusFilter ? <input name="status" type="hidden" value={statusFilter} /> : null}
          <Button className="h-9 rounded-md" size="sm" type="submit">
            {t('search')}
          </Button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((item) => {
            const isActive = item === 'ALL' ? !statusFilter : statusFilter === item;
            const href =
              item === 'ALL'
                ? localizeHref(locale, '/admin/cards')
                : `${localizeHref(locale, '/admin/cards')}?status=${item}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}`;

            return (
              <Button
                asChild
                className="h-8 rounded-md"
                key={item}
                size="sm"
                variant={isActive ? 'default' : 'outline'}
              >
                <Link href={href}>{item}</Link>
              </Button>
            );
          })}
        </div>
      </AdminFiltersBar>

      {filtered.length === 0 ? (
        <AdminEmptyState title={t('noCards')} />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {filtered.map((card) => (
              <AdminMobileCard
                key={card.id}
                title={<span className="font-mono font-bold">{card.number}</span>}
                subtitle={card.user.displayName?.trim() || 'Not set'}
                badge={
                  <div className="flex gap-1">
                    <AdminStatusBadge>{card.memberType}</AdminStatusBadge>
                    <AdminStatusBadge>{card.status}</AdminStatusBadge>
                  </div>
                }
                href={localizeHref(locale, `/admin/cards/${card.id}`)}
                rows={[
                  {
                    label: t('cardExpiresAt'),
                    value: card.expiresAt ? card.expiresAt.toLocaleDateString() : 'N/A',
                  },
                  {
                    label: t('created'),
                    value: card.createdAt.toLocaleDateString(),
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
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t('cardNumber')}</TableHead>
                    <TableHead>{t('memberName')}</TableHead>
                    <TableHead>{t('memberType')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('cardExpiresAt')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <AdminTableActionsHead label={t('actions')} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell className="font-mono text-sm font-medium">{card.number}</TableCell>
                      <TableCell>{card.user.displayName?.trim() || 'Not set'}</TableCell>
                      <TableCell>
                        <AdminStatusBadge>{card.memberType}</AdminStatusBadge>
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge>{card.status}</AdminStatusBadge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {card.expiresAt ? card.expiresAt.toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {card.createdAt.toLocaleDateString()}
                      </TableCell>
                      <AdminTableActionsCell>
                        <AdminRowActions
                          actionLabel={t('actions')}
                          actions={[
                            { label: t('view'), href: localizeHref(locale, `/admin/cards/${card.id}`), icon: <Eye className="size-4" /> },
                          ]}
                        />
                      </AdminTableActionsCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminDataTableShell>
          </div>
        </>
      )}
    </div>
  );
}
