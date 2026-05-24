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

interface AdminBusinessesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
}

function statusBadgeVariant(status: string) {
  if (status === 'PUBLISHED') return 'default';
  if (status === 'PENDING') return 'secondary';
  if (status === 'HIDDEN') return 'destructive';
  return 'outline';
}

export default async function AdminBusinessesPage({ params, searchParams }: AdminBusinessesPageProps) {
  const { locale } = await params;
  const { q, status } = await searchParams;

  const t = getT('admin');

  const searchTerm = q?.trim() ?? '';
  const statusFilter = status?.trim() ?? '';

  const allBusinesses = await db.query.businesses.findMany({
    columns: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          displayName: true,
        },
      },
      category: {
        columns: {
          name: true,
        },
      },
    },
    orderBy: (businesses, { desc }) => [desc(businesses.createdAt)],
  });

  let filtered = allBusinesses;

  if (statusFilter) {
    filtered = filtered.filter((b) => b.status === statusFilter);
  }

  if (searchTerm) {
    filtered = filtered.filter(
      (b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.slug.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  const statuses = ['ALL', 'DRAFT', 'PENDING', 'PUBLISHED', 'HIDDEN'] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('businessesTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('businessesDescription')}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <form className="flex max-w-sm gap-2" method="GET">
          <Input
            name="q"
            type="search"
            defaultValue={searchTerm}
            placeholder={t('businessName')}
          />
          {statusFilter ? (
            <input type="hidden" name="status" value={statusFilter} />
          ) : null}
          <Button type="submit">Search</Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => {
            const isActive = s === 'ALL' ? !statusFilter : statusFilter === s;
            const href =
              s === 'ALL'
                ? localizeHref(locale, '/admin/businesses')
                : `${localizeHref(locale, '/admin/businesses')}?status=${s}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}`;

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
        <p className="text-sm text-muted-foreground">{t('noBusinesses')}</p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('businessName')}</TableHead>
                <TableHead>{t('owner')}</TableHead>
                <TableHead>{t('category')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('created')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="font-medium">{b.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{b.slug}</div>
                  </TableCell>
                  <TableCell>{b.user?.displayName ?? '—'}</TableCell>
                  <TableCell>{b.category?.name ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(b.status)}>{b.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {b.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="link" size="sm" className="h-auto px-0" asChild>
                      <Link href={localizeHref(locale, `/admin/businesses/${b.id}`)}>
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
