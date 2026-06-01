import { count, desc } from 'drizzle-orm';
import { ShieldPlus } from 'lucide-react';
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
  AdminMobileCard,
  AdminPageHeader,
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

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={t('rolesTitle')}
        description={t('rolesDescription')}
        actions={
          canCreate ? (
            <Button size="sm" className="h-9 gap-2 bg-foreground text-background hover:bg-foreground/90" asChild>
              <Link href={localizeHref(locale, '/admin/roles/new')}>
                <ShieldPlus className="size-4" />
                <span className="hidden sm:inline">{t('createRole')}</span>
              </Link>
            </Button>
          ) : null
        }
      />

      {allRoles.length === 0 ? (
        <AdminEmptyState title={t('noRoles')} />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {allRoles.map((role) => (
              <AdminMobileCard
                key={role.id}
                title={
                  <span className="flex items-center gap-2">
                    {role.name}
                    {role.isSystem && (
                      <Badge variant="outline" className="text-[10px]">
                        system
                      </Badge>
                    )}
                  </span>
                }
                subtitle={`${userCountByRole.get(role.id) ?? 0} users`}
                rows={[
                  { label: t('roleSlug'), value: role.slug },
                  { label: t('roleDescription'), value: role.description ?? '—' },
                ]}
                href={localizeHref(locale, `/admin/roles/${role.id}`)}
              />
            ))}
          </div>

          <div className="hidden md:block">
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow className="border-0 bg-card">
                    <TableHead className="text-muted-foreground">{t('roleName')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('roleSlug')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('roleDescription')}</TableHead>
                    <TableHead className="text-muted-foreground">{t('isSystem')}</TableHead>
                    <TableHead className="text-right text-muted-foreground">{t('users')}</TableHead>
                    <AdminTableActionsHead label={t('actions')} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allRoles.map((role) => (
                    <TableRow key={role.id} className="border-border">
                      <TableCell>
                        <Link
                          href={localizeHref(locale, `/admin/roles/${role.id}`)}
                          className="font-medium text-foreground hover:underline"
                        >
                          {role.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{role.slug}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {role.description ?? '—'}
                      </TableCell>
                      <TableCell>
                        {role.isSystem ? (
                          <Badge variant="outline" className="text-[10px]">
                            system
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
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
