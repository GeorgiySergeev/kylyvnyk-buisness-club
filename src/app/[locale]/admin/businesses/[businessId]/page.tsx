import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { businesses } from '@/db/schema';
import { BusinessDetailTabs } from '@/features/admin/components/business-detail-tabs';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminBusinessDetailPageProps {
  params: Promise<{
    businessId: string;
    locale: SupportedLocale;
  }>;
}

export default async function AdminBusinessDetailPage({ params }: AdminBusinessDetailPageProps) {
  const { businessId, locale } = await params;
  const t = getT('admin', locale);

  const business = await db.query.businesses.findFirst({
    columns: {
      createdAt: true,
      description: true,
      email: true,
      id: true,
      isRecommended: true,
      isTopPartner: true,
      deletedAt: true,
      logoUrl: true,
      name: true,
      phone: true,
      slug: true,
      status: true,
      updatedAt: true,
      website: true,
    },
    where: eq(businesses.id, businessId),
    with: {
      category: { columns: { name: true } },
      city: { columns: { name: true } },
      country: { columns: { name: true } },
      user: {
        columns: {
          displayName: true,
          email: true,
          id: true,
          phone: true,
        },
      },
    },
  });

  if (!business) redirect(localizeHref(locale, '/admin/businesses'));

  return (
    <BusinessDetailTabs
      backHref={localizeHref(locale, '/admin/businesses')}
      backLabel={t('backToBusinesses')}
      business={{
        categoryName: business.category?.name ?? null,
        cityName: business.city?.name ?? null,
        countryName: business.country?.name ?? null,
        createdAt: business.createdAt.toLocaleString(),
        description: business.description,
        email: business.email,
        id: business.id,
        isDeleted: business.deletedAt !== null,
        isRecommended: business.isRecommended,
        isTopPartner: business.isTopPartner,
        name: business.name,
        ownerEmail: business.user?.email ?? null,
        ownerName: business.user?.displayName ?? null,
        ownerPhone: business.user?.phone ?? null,
        phone: business.phone,
        slug: business.slug,
        status: business.status,
        updatedAt: business.updatedAt.toLocaleString(),
        website: business.website,
      }}
      changeStatusLabel={t('changeStatus')}
      controlsTitle={t('businessControls')}
      detailTitle={t('businessDetail')}
      labels={{
        category: t('category'),
        city: t('city'),
        country: t('country'),
        created: t('created'),
        description: t('description'),
        email: t('email'),
        emptyValue: t('emptyValue'),
        owner: t('owner'),
        phone: t('phone'),
        slug: t('slug'),
        status: t('status'),
        updated: t('updated'),
        website: t('website'),
      }}
      tabLabels={{
        controls: t('controls'),
        overview: t('summary'),
        status: t('status'),
      }}
    />
  );
}
