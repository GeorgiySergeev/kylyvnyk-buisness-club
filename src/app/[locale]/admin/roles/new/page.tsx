import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { AdminDetailPageHeader } from '@/features/admin/components/admin-detail-page-header';
import { AdminPanel } from '@/features/admin/components/admin-ui';
import { guardSuperAdmin } from '@/features/auth/lib/permission-guards';
import { RoleForm } from '@/features/roles/components/role-form';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface NewRolePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function NewRolePage({ params }: NewRolePageProps) {
  const { locale } = await params;
  await guardSuperAdmin(locale);
  const t = getT('admin', locale);

  return (
    <div className="flex flex-col gap-8">
      <AdminDetailPageHeader
        backHref={localizeHref(locale, '/admin/roles')}
        backLabel={t('backToRoles')}
        subtitle={t('rolesDescription')}
        title={t('createRole')}
      />

      <AdminPanel>
        <RoleForm locale={locale} />
      </AdminPanel>
    </div>
  );
}
