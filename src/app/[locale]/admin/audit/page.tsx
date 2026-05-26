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
    q?: string;
  }>;
}

export default async function AdminAuditPage({ params, searchParams }: AdminAuditPageProps) {
  const { locale } = await params;
  const { action, q } = await searchParams;
  const t = getT('admin', locale);

  const searchTerm = q?.trim() ?? '';
  const actionFilter = action?.trim() ?? '';

  const allLogs = await db.query.auditLogs.findMany({
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
    orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
    with: {
      actor: {
        columns: {
          displayName: true,
          id: true,
        },
      },
    },
  });

  let filtered = allLogs;

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

  const uniqueActions = [...new Set(allLogs.map((log) => log.action))].sort().slice(0, 12);

  return (
    <div className="space-y-5">
      <AdminPageHeader description={t('auditDescription')} title={t('auditTitle')} />

      <AdminFiltersBar>
        <form className="flex w-full gap-2 sm:max-w-md" method="GET">
          <AdminSearchInput name="q" placeholder={t('auditActionFilter')} value={searchTerm} />
          {actionFilter ? <input name="action" type="hidden" value={actionFilter} /> : null}
          <Button className="h-9 rounded-md" size="sm" type="submit">
            Search
          </Button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          <Button
            asChild
            className="h-8 rounded-md"
            size="sm"
            variant={!actionFilter ? 'default' : 'outline'}
          >
            <Link href={localizeHref(locale, '/admin/audit')}>All</Link>
          </Button>
          {uniqueActions.map((item) => (
            <Button
              asChild
              className="h-8 rounded-md"
              key={item}
              size="sm"
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

      {filtered.length === 0 ? (
        <AdminEmptyState title={t('noAuditLogs')} />
      ) : (
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
              {filtered.map((log) => (
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
      )}
    </div>
  );
}
