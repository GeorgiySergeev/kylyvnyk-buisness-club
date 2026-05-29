import { eq, isNull } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { db } from '@/db/client';
import { permissions as permissionsTable } from '@/db/schema';
import { AdminPageHeader, AdminPanel } from '@/features/admin/components/admin-ui';
import { guardSuperAdmin } from '@/features/auth/lib/permission-guards';
import { RoleForm } from '@/features/roles/components/role-form';
import { RolePermissionEditor } from '@/features/roles/components/role-permission-editor';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface RoleDetailPageProps {
  params: Promise<{
    locale: SupportedLocale;
    id: string;
  }>;
}

export default async function RoleDetailPage({ params }: RoleDetailPageProps) {
  const { locale, id } = await params;
  await guardSuperAdmin(locale);
  const t = getT('admin', locale);

  const role = await db.query.roles.findFirst({
    where: (table, { and: _and, eq: _eq }) => _and(_eq(table.id, id), isNull(table.deletedAt)),
  });

  if (!role) {
    notFound();
  }

  const perms = await db
    .select()
    .from(permissionsTable)
    .where(eq(permissionsTable.roleId, id));

  const permLabels = {
    resource: t('resource'),
    canView: t('canView'),
    canCreate: t('canCreate'),
    canEdit: t('canEdit'),
    canDelete: t('canDelete'),
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={role.name}
        description={t('rolesDescription')}
        actions={
          <Button variant="outline" size="sm" className="h-9 border-0 bg-card text-foreground" asChild>
            <Link href={localizeHref(locale, '/admin/roles')}>{t('backToRoles')}</Link>
          </Button>
        }
      />

      <AdminPanel title={t('editRole')}>
        <RoleForm locale={locale} role={role} />
      </AdminPanel>

      <AdminPanel title={t('permissions')}>
        <RolePermissionEditor
          roleId={role.id}
          initialPermissions={perms.map((p) => ({
            resource: p.resource as import('@/db/schema/permission').Resource,
            canView: p.canView,
            canCreate: p.canCreate,
            canEdit: p.canEdit,
            canDelete: p.canDelete,
          }))}
          labels={permLabels}
        />
      </AdminPanel>
    </div>
  );
}
