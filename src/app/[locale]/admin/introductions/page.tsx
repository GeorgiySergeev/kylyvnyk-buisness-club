import { and, desc, eq } from 'drizzle-orm';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/db/client';
import { introductions } from '@/db/schema';
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

function statusBadgeVariant(status: string) {
  if (status === 'APPROVED') return 'default';
  if (status === 'REJECTED') return 'destructive';
  if (status === 'UNDER_REVIEW') return 'secondary';
  return 'outline';
}

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('introductionsTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('introductionsDescriptionAdmin')}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <form className="flex max-w-sm gap-2" method="GET">
          <Input
            defaultValue={searchTerm}
            name="q"
            placeholder={t('introductionsSearchPlaceholder')}
            type="search"
          />
          {statusFilter && statusFilter !== 'ALL' ? (
            <input name="status" type="hidden" value={statusFilter} />
          ) : null}
          <Button className="rounded-field" type="submit">
            {t('search')}
          </Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((item) => {
            const isActive = item === 'ALL' ? !statusFilter || statusFilter === 'ALL' : statusFilter === item;
            const href =
              item === 'ALL'
                ? localizeHref(locale, '/admin/introductions')
                : `${localizeHref(locale, '/admin/introductions')}?status=${item}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}`;

            return (
              <Button
                key={item}
                asChild
                className="rounded-field"
                size="sm"
                variant={isActive ? 'default' : 'outline'}
              >
                <Link href={href}>{item}</Link>
              </Button>
            );
          })}
        </div>
      </div>

      {filteredRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('noIntroductions')}</p>
      ) : (
        <div className="overflow-hidden rounded-box border border-border">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>{t('created')}</th>
                <th>{t('business')}</th>
                <th>{t('requester')}</th>
                <th>{t('client')}</th>
                <th>{t('status')}</th>
                <th>{t('moderation')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="text-xs text-muted-foreground">
                    {row.createdAt.toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <div className="font-medium text-foreground">{row.targetBusiness?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {[row.targetBusiness?.city?.name, row.targetBusiness?.country?.name]
                        .filter(Boolean)
                        .join(' - ') || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-foreground">
                      {row.requester?.displayName ?? 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">{row.requester?.phone}</div>
                  </td>
                  <td>
                    <div className="text-sm text-foreground">{row.clientName}</div>
                    <div className="text-xs text-muted-foreground">{row.clientContact}</div>
                    {row.message ? (
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.message}</div>
                    ) : null}
                  </td>
                  <td>
                    <Badge className="rounded-field" variant={statusBadgeVariant(row.status)}>
                      {row.status}
                    </Badge>
                    {row.adminNote ? (
                      <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">{row.adminNote}</p>
                    ) : null}
                  </td>
                  <td className="min-w-56">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
