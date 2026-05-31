import { and, desc, eq } from 'drizzle-orm';
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
import { introductions } from '@/db/schema';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminFiltersBar,
  AdminMobileCard,
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import {
  AdminTableActionsCell,
  AdminTableActionsHead,
  AdminTableNavigateAction,
} from '@/features/admin/components/admin-table-actions';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminIntroductionsPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    q?: string;
    status?: string;
  }>;
}

const STATUS_FILTERS = ['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'] as const;
type IntroductionStatusFilter = (typeof STATUS_FILTERS)[number];

export default async function AdminIntroductionsPage({
  params,
  searchParams,
}: AdminIntroductionsPageProps) {
  const { locale } = await params;
  const { q, status } = await searchParams;
  const t = getT('admin', locale);

  const searchTerm = q?.trim() ?? '';
  const statusFilter: IntroductionStatusFilter | '' =
    status && STATUS_FILTERS.includes(status as IntroductionStatusFilter)
      ? (status as IntroductionStatusFilter)
      : '';

  type IntroductionRow = {
    adminNote: string | null;
    clientContact: string;
    clientName: string;
    createdAt: Date;
    id: string;
    message: string | null;
    requester: { displayName: string | null; phone: string } | null;
    status: string;
    targetBusiness: {
      city: { name: string } | null;
      country: { name: string } | null;
      deletedAt: Date | null;
      name: string;
      status: string;
    } | null;
  };

  const rows: IntroductionRow[] = await db.query.introductions.findMany({
    columns: {
      adminNote: true,
      clientContact: true,
      clientName: true,
      createdAt: true,
      id: true,
      message: true,
      status: true,
    },
    orderBy: [desc(introductions.createdAt)],
    where: and(
      statusFilter && statusFilter !== 'ALL' ? eq(introductions.status, statusFilter) : undefined,
    ),
    with: {
      requester: {
        columns: {
          displayName: true,
          phone: true,
        },
      },
      targetBusiness: {
        columns: {
          deletedAt: true,
          name: true,
          status: true,
        },
        with: {
          city: {
            columns: {
              name: true,
            },
          },
          country: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  });

  const filteredRows = rows.filter((row) => {
    const targetBusiness = row.targetBusiness;
    if (!targetBusiness) return false;
    if (targetBusiness.status !== 'PUBLISHED') return false;
    if (targetBusiness.deletedAt !== null) return false;
    if (!searchTerm) return true;

    const lowerSearch = searchTerm.toLowerCase();
    return (
      targetBusiness.name.toLowerCase().includes(lowerSearch) ||
      (row.requester?.displayName ?? '').toLowerCase().includes(lowerSearch) ||
      row.clientName.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description={t('introductionsDescriptionAdmin')}
        title={t('introductionsTitle')}
      />

      <AdminFiltersBar>
        <form className="flex w-full gap-2 sm:max-w-md" method="GET">
          <AdminSearchInput
            name="q"
            placeholder={t('introductionsSearchPlaceholder')}
            value={searchTerm}
          />
          {statusFilter && statusFilter !== 'ALL' ? (
            <input name="status" type="hidden" value={statusFilter} />
          ) : null}
          <Button className="h-9 rounded-md" size="sm" type="submit">
            {t('search')}
          </Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((item) => {
            const isActive =
              item === 'ALL' ? !statusFilter || statusFilter === 'ALL' : statusFilter === item;
            const href =
              item === 'ALL'
                ? localizeHref(locale, '/admin/introductions')
                : `${localizeHref(locale, '/admin/introductions')}?status=${item}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}`;

            return (
              <Button
                key={item}
                asChild
                className="h-8 rounded-md"
                size="sm"
                variant={isActive ? 'default' : 'outline'}
              >
                <Link href={href}>{item}</Link>
              </Button>
            );
          })}
        </div>
      </AdminFiltersBar>

      {filteredRows.length === 0 ? (
        <AdminEmptyState title={t('noIntroductions')} />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-4 md:hidden">
            {filteredRows.map((row) => (
              <div key={row.id} className="rounded-lg border border-border/70 bg-card/95 p-3">
                <AdminMobileCard
                  href={localizeHref(locale, `/admin/introductions/${row.id}`)}
                  title={row.targetBusiness?.name ?? 'N/A'}
                  subtitle={[row.targetBusiness?.city?.name, row.targetBusiness?.country?.name]
                    .filter(Boolean)
                    .join(' - ')}
                  badge={<AdminStatusBadge>{row.status}</AdminStatusBadge>}
                  rows={[
                    {
                      label: t('requester'),
                      value: (
                        <span>
                          {row.requester?.displayName ?? 'N/A'}
                          <span className="ml-1 text-muted-foreground">{row.requester?.phone}</span>
                        </span>
                      ),
                    },
                    {
                      label: t('client'),
                      value: (
                        <span>
                          {row.clientName}
                          <span className="ml-1 text-muted-foreground">{row.clientContact}</span>
                        </span>
                      ),
                    },
                    {
                      label: t('created'),
                      value: row.createdAt.toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }),
                    },
                  ]}
                />
                {row.message ? (
                  <p className="mt-1 px-1 text-xs text-muted-foreground">{row.message}</p>
                ) : null}
                <div className="mt-3 px-1">
                  <Button asChild className="h-9 rounded-md" size="sm" variant="outline">
                    <Link href={localizeHref(locale, `/admin/introductions/${row.id}`)}>
                      {t('view')}
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block">
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t('created')}</TableHead>
                    <TableHead>{t('business')}</TableHead>
                    <TableHead>{t('requester')}</TableHead>
                    <TableHead>{t('client')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <AdminTableActionsHead label={t('actions')} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="text-xs text-muted-foreground">
                        {row.createdAt.toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">
                          <Link
                            className="hover:underline"
                            href={localizeHref(locale, `/admin/introductions/${row.id}`)}
                          >
                            {row.targetBusiness?.name}
                          </Link>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {[row.targetBusiness?.city?.name, row.targetBusiness?.country?.name]
                            .filter(Boolean)
                            .join(' - ') || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium text-foreground">
                          {row.requester?.displayName ?? 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">{row.requester?.phone}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground">{row.clientName}</div>
                        <div className="text-xs text-muted-foreground">{row.clientContact}</div>
                        {row.message ? (
                          <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                            {row.message}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge>{row.status}</AdminStatusBadge>
                        {row.adminNote ? (
                          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                            {row.adminNote}
                          </p>
                        ) : null}
                      </TableCell>
                      <AdminTableActionsCell>
                        <AdminTableNavigateAction
                          href={localizeHref(locale, `/admin/introductions/${row.id}`)}
                          label={t('view')}
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
