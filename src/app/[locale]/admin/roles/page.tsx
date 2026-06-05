import { count, desc } from 'drizzle-orm';
import { KeyRound, ShieldCheck, ShieldPlus, UsersRound } from 'lucide-react';
import Link from 'next/link';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Badge } from '@/components/ui/badge';
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
import { roles, userRoles } from '@/db/schema';
import {
  AdminTableActionsCell,
  AdminTableActionsHead,
} from '@/features/admin/components/admin-table-actions';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminMetricCard,
  AdminMobileCard,
  AdminPageHeader,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { RoleRowActions } from '@/features/admin/components/role-row-actions';
import { guardSuperAdmin } from '@/features/auth/lib/permission-guards';
import { canCreateResource, getCurrentUserPermissions } from '@/lib/auth/permissions';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface RolesPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function AdminRolesPage({ params }: RolesPageProps) {
  const { locale } = await params;
  await guardSuperAdmin(locale);
  const t = getT('admin', locale);
  const userPerms = await getCurrentUserPermissions();

  const allRoles = await db.query.roles.findMany({
    where: (table, { isNull: _isNull }) => _isNull(table.deletedAt),
    orderBy: [desc(roles.createdAt)],
  });

  const userCountRows = await db
    .select({ roleId: userRoles.roleId, count: count() })
    .from(userRoles)
    .groupBy(userRoles.roleId);

  const userCountByRole = new Map(userCountRows.map((r) => [r.roleId, r.count]));
  const canCreate = canCreateResource(userPerms.permissions, 'roles');
  const assignedUsersCount = userCountRows.reduce((total, row) => total + row.count, 0);
  const systemRolesCount = allRoles.filter((role) => role.isSystem).length;
  const customRolesCount = allRoles.length - systemRolesCount;

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        actions={
          canCreate ? (
            <Button asChild className="h-9 gap-2" size="sm">
              <Link href={localizeHref(locale, '/admin/roles/new')}>
                <ShieldPlus className="size-4" />
                <span className="hidden sm:inline">{t('createRole')}</span>
              </Link>
            </Button>
          ) : null
        }
        description={t('rolesDescription')}
        eyebrow={t('navAccess')}
        title={t('rolesTitle')}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminMetricCard
          icon={<ShieldCheck className="size-4" />}
          label={t('rolesMetricTotal')}
          meta={t('liveDatabaseSnapshot')}
          value={allRoles.length}
        />
        <AdminMetricCard
          icon={<UsersRound className="size-4" />}
          label={t('rolesMetricAssigned')}
          meta={t('liveDatabaseSnapshot')}
          tone={assignedUsersCount > 0 ? 'success' : undefined}
          value={assignedUsersCount}
        />
        <AdminMetricCard
          icon={<KeyRound className="size-4" />}
          label={t('rolesMetricSystem')}
          meta={t('liveDatabaseSnapshot')}
          tone="info"
          value={systemRolesCount}
        />
        <AdminMetricCard
          icon={<ShieldPlus className="size-4" />}
          label={t('rolesMetricCustom')}
          meta={t('liveDatabaseSnapshot')}
          value={customRolesCount}
        />
      </div>

      {allRoles.length === 0 ? (
        <AdminEmptyState title={t('noRoles')} />
      ) : (
        <>
          <div className="flex flex-col gap-1 rounded-ds-radius-md border border-ds-border bg-ds-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-ds-text-sm font-semibold text-ds-text">{t('rolesDirectory')}</p>
              <p className="text-ds-text-xs text-ds-text-muted">{t('rolesDescription')}</p>
            </div>
            <AdminStatusBadge tone="info">
              {allRoles.length} {t('rolesTitle')}
            </AdminStatusBadge>
          </div>

          <div className="space-y-3 md:hidden">
            {allRoles.map((role) => (
              <AdminMobileCard
                key={role.id}
                title={
                  <span className="flex items-center gap-2">
                    {role.name}
                    {role.isSystem && (
                      <Badge className="text-[10px]" variant="outline">
                        {t('roleSystemLabel')}
                      </Badge>
                    )}
                  </span>
                }
                subtitle={`${userCountByRole.get(role.id) ?? 0} ${t('users')}`}
                rows={[
                  { label: t('roleSlug'), value: role.slug },
                  { label: t('roleDescription'), value: role.description ?? t('roleNoDescription') },
                ]}
                href={localizeHref(locale, `/admin/roles/${role.id}`)}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-0 bg-ds-surface-2/70 hover:bg-ds-surface-2/70">
                    <TableHead className="text-ds-text-muted">{t('roleName')}</TableHead>
                    <TableHead className="text-ds-text-muted">{t('roleSlug')}</TableHead>
                    <TableHead className="text-ds-text-muted">{t('roleDescription')}</TableHead>
                    <TableHead className="text-ds-text-muted">{t('isSystem')}</TableHead>
                    <TableHead className="text-right text-ds-text-muted">{t('users')}</TableHead>
                    <AdminTableActionsHead label={t('actions')} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allRoles.map((role) => (
                    <TableRow className="border-ds-border" key={role.id}>
                      <TableCell>
                        <Link
                          className="font-medium text-ds-text hover:text-ds-accent"
                          href={localizeHref(locale, `/admin/roles/${role.id}`)}
                        >
                          {role.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-ds-text-muted">{role.slug}</TableCell>
                      <TableCell className="max-w-xs truncate text-ds-text-muted">
                        {role.description ?? t('roleNoDescription')}
                      </TableCell>
                      <TableCell>
                        {role.isSystem ? (
                          <Badge className="text-[10px]" variant="outline">
                            {t('roleSystemLabel')}
                          </Badge>
                        ) : (
                          <span className="text-ds-text-muted">{t('notDefined')}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-ds-text-muted">
                        {userCountByRole.get(role.id) ?? 0}
                      </TableCell>
                      <AdminTableActionsCell>
                        <RoleRowActions
                          actionLabel={t('actions')}
                          deleteLabel={t('delete')}
                          editLabel={t('edit')}
                          roleId={role.id}
                          isSystem={role.isSystem}
                          viewHref={localizeHref(locale, `/admin/roles/${role.id}`)}
                          viewLabel={t('view')}
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
