import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { AdminDetailPageHeader } from '@/features/admin/components/admin-detail-page-header';
import { AdminPanel } from '@/features/admin/components/admin-ui';
import { UserCreateForm } from '@/features/admin/components/user-create-form';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface NewUserPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function NewUserPage({ params }: NewUserPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);

  return (
    <div className="flex flex-col gap-8">
      <AdminDetailPageHeader
        backHref={localizeHref(locale, '/admin/users')}
        backLabel={t('backToUsers')}
        subtitle={t('createUserDescription')}
        title={t('createUser')}
      />

      <AdminPanel>
        <UserCreateForm
          labels={{
            create: t('create'),
            displayName: t('name'),
            email: t('email'),
            issueCard: t('issueClubCard'),
            membership: t('membership'),
            noMembership: t('noMembership'),
            phone: t('phone'),
            role: t('role'),
            status: t('status'),
          }}
          locale={locale}
        />
      </AdminPanel>
    </div>
  );
}
