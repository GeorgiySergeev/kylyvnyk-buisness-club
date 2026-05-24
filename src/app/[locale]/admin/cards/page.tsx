import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { db } from '@/db/client';
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

function statusBadgeVariant(status: string) {
  if (status === 'ACTIVE') return 'default';
  if (status === 'EXPIRED') return 'destructive';
  return 'outline';
}

function memberTypeBadgeVariant(type: string) {
  if (type === 'VIP') return 'default';
  if (type === 'BUSINESS') return 'secondary';
  return 'outline';
}

export default async function AdminCardsPage({ params, searchParams }: AdminCardsPageProps) {
  const { locale } = await params;
  const { q, status } = await searchParams;

  const t = getT('admin');

  const searchTerm = q?.trim() ?? '';
  const statusFilter = status?.trim() ?? '';

  const allCards = await db.query.clubCards.findMany({
    columns: {
      id: true,
      number: true,
      memberType: true,
      status: true,
      expiresAt: true,
      createdAt: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          displayName: true,
          phone: true,
          email: true,
        },
      },
    },
    orderBy: (cards, { desc }) => [desc(cards.createdAt)],
  });

  let filtered = allCards;

  if (statusFilter) {
    filtered = filtered.filter((c) => c.status === statusFilter);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.number.toLowerCase().includes(term) ||
        c.user.displayName?.toLowerCase().includes(term) ||
        c.user.phone.toLowerCase().includes(term),
    );
  }

  const statuses = ['ALL', 'ACTIVE', 'INACTIVE', 'EXPIRED'] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('cardsTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('cardsDescription')}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <form className="flex max-w-sm gap-2" method="GET">
          <Input
            name="q"
            type="search"
            defaultValue={searchTerm}
            placeholder={t('cardNumber')}
          />
          {statusFilter ? (
            <input type="hidden" name="status" value={statusFilter} />
          ) : null}
          <Button type="submit">{t('searchPlaceholder')}</Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => {
            const isActive = s === 'ALL' ? !statusFilter : statusFilter === s;
            const href =
              s === 'ALL'
                ? localizeHref(locale, '/admin/cards')
                : `${localizeHref(locale, '/admin/cards')}?status=${s}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}`;

            return (
              <Button
                key={s}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
                asChild
              >
                <Link href={href}>{s}</Link>
              </Button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('noCards')}</p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('cardNumber')}</TableHead>
                <TableHead>{t('memberName')}</TableHead>
                <TableHead>{t('memberType')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('cardExpiresAt')}</TableHead>
                <TableHead>{t('created')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {card.number}
                  </TableCell>
                  <TableCell>{card.user.displayName ?? card.user.phone}</TableCell>
                  <TableCell>
                    <Badge variant={memberTypeBadgeVariant(card.memberType)}>
                      {card.memberType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(card.status)}>
                      {card.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {card.expiresAt
                      ? card.expiresAt.toLocaleDateString()
                      : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {card.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" size="sm" className="h-auto px-0" asChild>
                      <Link href={localizeHref(locale, `/admin/cards/${card.id}`)}>
                        {t('view')}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
