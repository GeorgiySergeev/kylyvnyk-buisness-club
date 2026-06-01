import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { AdminDetailPageHeader } from '@/features/admin/components/admin-detail-page-header';
import { AdminPanel } from '@/features/admin/components/admin-ui';
import { BusinessCreateForm } from '@/features/admin/components/business-create-form';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface NewBusinessPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function NewBusinessPage({ params }: NewBusinessPageProps) {
  const { locale } = await params;
  const t = getT('admin', locale);

  return (
    <div className="flex flex-col gap-8">
      <AdminDetailPageHeader
        backHref={localizeHref(locale, '/admin/businesses')}
        backLabel={t('backToBusinesses')}
        subtitle={t('createBusinessDescription')}
        title={t('createBusiness')}
      />

      <AdminPanel>
        <BusinessCreateForm
          labels={{
            create: t('create'),
            description: t('description'),
            email: t('email'),
            name: t('name'),
            ownerPhone: t('phone'),
            phone: t('phone'),
            slug: t('slug'),
            status: t('status'),
            website: t('website'),
          }}
          locale={locale}
        />
      </AdminPanel>
    </div>
  );
}
