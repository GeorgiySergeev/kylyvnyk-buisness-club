import Link from 'next/link';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/features/admin/components/admin-ui';
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
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title={t('createRole')}
        description={t('rolesDescription')}
        actions={
          <Button variant="outline" size="sm" className="h-9 border-0 bg-card text-foreground" asChild>
            <Link href={localizeHref(locale, '/admin/roles')}>{t('backToRoles')}</Link>
          </Button>
        }
      />
      <RoleForm locale={locale} />
    </div>
  );
}
