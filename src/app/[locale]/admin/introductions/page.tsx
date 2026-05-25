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
  AdminPageHeader,
  AdminSearchInput,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { IntroductionModerationForm } from '@/features/introductions/components/introduction-moderation-form';
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
  const t = getT('admin');

  const searchTerm = q?.trim() ?? '';
  const statusFilter: IntroductionStatusFilter | '' =
    status && STATUS_FILTERS.includes(status as IntroductionStatusFilter)
      ? (status as IntroductionStatusFilter)
      : '';

  const rows = await db.query.introductions.findMany({
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

  const filteredRows = rows.filter(
    (row) =>
      Boolean(row.targetBusiness) &&
      row.targetBusiness.status === 'PUBLISHED' &&
      row.targetBusiness.deletedAt === null &&
      (!searchTerm ||
        row.targetBusiness.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.requester?.displayName ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.clientName.toLowerCase().includes(searchTerm.toLowerCase())),
  );

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
        <AdminDataTableShell>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t('created')}</TableHead>
                <TableHead>{t('business')}</TableHead>
                <TableHead>{t('requester')}</TableHead>
                <TableHead>{t('client')}</TableHead>
                <TableHead>{t('status')}</TableHead>
                <TableHead>{t('moderation')}</TableHead>
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
                    <div className="font-medium text-foreground">{row.targetBusiness?.name}</div>
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
                      <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                        {row.adminNote}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell className="min-w-56">
                    <IntroductionModerationForm
                      currentNote={row.adminNote}
                      currentStatus={row.status}
                      introductionId={row.id}
                      labels={{
                        adminNotePlaceholder: t('adminNotePlaceholder'),
                        approve: t('approve'),
                        reject: t('reject'),
                        save: t('save'),
                        statusUpdated: t('introductionStatusUpdated'),
                        underReview: t('underReview'),
                        updateError: t('introductionUpdateError'),
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminDataTableShell>
      )}
    </div>
  );
}
