import { Activity, Database, Filter, UserRoundCheck } from 'lucide-react';
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

interface AdminAuditPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    action?: string;
    page?: string;
    q?: string;
  }>;
}

export default async function AdminAuditPage({ params, searchParams }: AdminAuditPageProps) {
  const { locale } = await params;
  const { action, page, q } = await searchParams;
  const t = getT('admin', locale);
  const PAGE_SIZE = 20;

  const searchTerm = q?.trim() ?? '';
  const actionFilter = action?.trim() ?? '';
  const rawPage = Number(page ?? '1');
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;

  type AuditLogRow = {
    action: string;
    actor: { displayName: string | null; id: string } | null;
    createdAt: Date;
    entityId: string | null;
    entityType: string | null;
    id: string;
    ipAddress: string | null;
    payload: unknown;
  };

  const allLogs: AuditLogRow[] = await db.query.auditLogs.findMany({
    columns: {
      action: true,
      createdAt: true,
      entityId: true,
      entityType: true,
      id: true,
      ipAddress: true,
      payload: true,
    },
    limit: 200,
    with: {
      actor: {
        columns: {
          displayName: true,
          id: true,
        },
      },
    },
  });

  let filtered = [...allLogs].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  if (actionFilter) {
    filtered = filtered.filter((log) => log.action === actionFilter);
  }

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.action.toLowerCase().includes(lower) ||
        log.actor?.displayName?.toLowerCase().includes(lower) ||
        log.entityType?.toLowerCase().includes(lower) ||
        log.entityId?.toLowerCase().includes(lower),
    );
  }

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageNumber = Math.min(currentPage, totalPages);
  const pageStart = (pageNumber - 1) * PAGE_SIZE;
  const pageLogs = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const startRow = totalCount === 0 ? 0 : pageStart + 1;
  const endRow = Math.min(pageStart + PAGE_SIZE, totalCount);
  const actorCount = new Set(allLogs.map((log) => log.actor?.id).filter(Boolean)).size;
  const entityCount = new Set(allLogs.map((log) => log.entityType).filter(Boolean)).size;

  const createAuditHref = (nextPage?: number) => {
    const params = new URLSearchParams();
    if (actionFilter) params.set('action', actionFilter);
    if (searchTerm) params.set('q', searchTerm);
    if (nextPage && nextPage > 1) params.set('page', String(nextPage));
    const query = params.toString();
    return query ? `${localizeHref(locale, '/admin/audit')}?${query}` : localizeHref(locale, '/admin/audit');
  };

  const uniqueActions = [...new Set(allLogs.map((log) => log.action))].sort().slice(0, 12);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description={t('auditDescription')}
        eyebrow={t('operational')}
        title={t('auditTitle')}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard
          icon={<Activity className="size-4" />}
          label={t('auditMetricTotal')}
          meta={t('liveDatabaseSnapshot')}
          value={allLogs.length}
        />
        <AdminMetricCard
          icon={<Filter className="size-4" />}
          label={t('auditMetricFiltered')}
          meta={t('liveDatabaseSnapshot')}
          tone={actionFilter || searchTerm ? 'info' : undefined}
          value={totalCount}
        />
        <AdminMetricCard
          icon={<UserRoundCheck className="size-4" />}
          label={t('auditMetricActors')}
          meta={t('liveDatabaseSnapshot')}
          value={actorCount}
        />
        <AdminMetricCard
          icon={<Database className="size-4" />}
          label={t('auditMetricEntities')}
          meta={t('liveDatabaseSnapshot')}
          value={entityCount}
        />
      </div>

      <AdminFiltersBar>
        <form className="flex w-full gap-2 sm:max-w-md" method="GET">
          <AdminSearchInput name="q" placeholder={t('auditActionFilter')} value={searchTerm} />
          {actionFilter ? <input name="action" type="hidden" value={actionFilter} /> : null}
          <Button className="h-11 rounded-md" type="submit">
            {t('search')}
          </Button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          <Button
            asChild
            className="h-11 rounded-md"
            variant={!actionFilter ? 'default' : 'outline'}
          >
            <Link href={localizeHref(locale, '/admin/audit')}>{t('auditAll')}</Link>
          </Button>
          {uniqueActions.map((item) => (
            <Button
              asChild
              className="h-11 rounded-md"
              key={item}
              variant={actionFilter === item ? 'default' : 'outline'}
            >
              <Link
                href={`${localizeHref(locale, '/admin/audit')}?action=${item}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}`}
              >
                {item}
              </Link>
            </Button>
          ))}
        </div>
      </AdminFiltersBar>

      {totalCount === 0 ? (
        <AdminEmptyState title={t('noAuditLogs')} />
      ) : (
        <div className="space-y-4">
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {pageLogs.map((log) => (
              <AdminMobileCard
                key={log.id}
                title={log.action}
                subtitle={log.actor?.displayName ?? 'System'}
                badge={<AdminStatusBadge tone="info">{log.action}</AdminStatusBadge>}
                rows={[
                  { label: t('auditEntity'), value: `${log.entityType ?? 'N/A'}${log.entityId ? ` (${log.entityId.slice(0, 8)}...)` : ''}` },
                  { label: t('auditIp'), value: log.ipAddress ?? 'N/A' },
                  {
                    label: t('created'),
                    value: log.createdAt.toLocaleString(),
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
                    <TableHead>{t('auditAction')}</TableHead>
                    <TableHead>{t('auditActor')}</TableHead>
                    <TableHead>{t('auditEntity')}</TableHead>
                    <TableHead>{t('auditPayload')}</TableHead>
                    <TableHead>{t('auditIp')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <AdminStatusBadge tone="info">{log.action}</AdminStatusBadge>
                      </TableCell>
                      <TableCell>{log.actor?.displayName ?? 'System'}</TableCell>
                      <TableCell>
                        <div>{log.entityType ?? 'N/A'}</div>
                        {log.entityId ? (
                          <div className="font-mono text-[11px] text-muted-foreground">
                            {log.entityId.slice(0, 8)}...
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="max-w-xs truncate font-mono text-[11px] text-muted-foreground">
                        {log.payload ? JSON.stringify(log.payload) : 'N/A'}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.ipAddress ?? 'N/A'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {log.createdAt.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminDataTableShell>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {t('auditShowingRows')
                .replace('{start}', String(startRow))
                .replace('{end}', String(endRow))
                .replace('{count}', String(totalCount))}
            </p>
            <div className="flex items-center gap-2">
              <Button asChild disabled={pageNumber <= 1} size="sm" variant="outline">
                <Link href={createAuditHref(pageNumber - 1)}>{t('paginationPrev')}</Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pageNumber} / {totalPages}
              </span>
              <Button asChild disabled={pageNumber >= totalPages} size="sm" variant="outline">
                <Link href={createAuditHref(pageNumber + 1)}>{t('paginationNext')}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
