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

interface AdminAuditPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    q?: string;
    action?: string;
  }>;
}

export default async function AdminAuditPage({ params, searchParams }: AdminAuditPageProps) {
  const { locale } = await params;
  const { q, action } = await searchParams;

  const t = getT('admin');

  const searchTerm = q?.trim() ?? '';
  const actionFilter = action?.trim() ?? '';

  const allLogs = await db.query.auditLogs.findMany({
    columns: {
      id: true,
      action: true,
      entityType: true,
      entityId: true,
      payload: true,
      ipAddress: true,
      createdAt: true,
    },
    with: {
      actor: {
        columns: {
          id: true,
          displayName: true,
        },
      },
    },
    orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
    limit: 200,
  });

  let filtered = allLogs;

  if (actionFilter) {
    filtered = filtered.filter((l) => l.action === actionFilter);
  }

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.action.toLowerCase().includes(lower) ||
        l.actor?.displayName?.toLowerCase().includes(lower) ||
        l.entityType?.toLowerCase().includes(lower) ||
        l.entityId?.toLowerCase().includes(lower),
    );
  }

  const uniqueActions = [...new Set(allLogs.map((l) => l.action))].sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('auditTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('auditDescription')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form className="flex max-w-sm gap-2" method="GET">
          <Input
            name="q"
            type="search"
            defaultValue={searchTerm}
            placeholder={t('auditActionFilter')}
          />
          {actionFilter ? (
            <input type="hidden" name="action" value={actionFilter} />
          ) : null}
          <Button type="submit">Search</Button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          <Button
            variant={!actionFilter ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            asChild
          >
            <Link href={localizeHref(locale, '/admin/audit')}>All</Link>
          </Button>
          {uniqueActions.map((a) => (
            <Button
              key={a}
              variant={actionFilter === a ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              asChild
            >
              <Link
                href={`${localizeHref(locale, '/admin/audit')}?action=${a}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}`}
              >
                {a}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('noAuditLogs')}</p>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
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
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.actor?.displayName ?? '—'}</TableCell>
                  <TableCell>
                    <div>{log.entityType ?? '—'}</div>
                    {log.entityId ? (
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {log.entityId.slice(0, 8)}...
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-mono text-[11px] text-muted-foreground">
                    {log.payload ? JSON.stringify(log.payload) : '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.ipAddress ?? '—'}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {log.createdAt.toLocaleString()}
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
