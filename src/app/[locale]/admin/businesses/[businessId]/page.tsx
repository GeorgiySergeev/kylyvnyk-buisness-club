import Link from 'next/link';
import { redirect } from 'next/navigation';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { db } from '@/db/client';
import {
  AdminDescriptionList,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { BusinessStatusForm } from '@/features/admin/components/business-status-form';
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
  const t = getT('admin');

  const business = await db.query.businesses.findFirst({
    columns: {
      createdAt: true,
      description: true,
      email: true,
      id: true,
      isRecommended: true,
      isTopPartner: true,
      logoUrl: true,
      name: true,
      phone: true,
      slug: true,
      status: true,
      updatedAt: true,
      website: true,
    },
    where: (businesses, { eq }) => eq(businesses.id, businessId),
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
    <div className="max-w-5xl space-y-5">
      <Button asChild className="h-8 rounded-md px-0" size="sm" variant="link">
        <Link href={localizeHref(locale, '/admin/businesses')}>Back to businesses</Link>
      </Button>

      <AdminPageHeader
        actions={<AdminStatusBadge>{business.status}</AdminStatusBadge>}
        description={business.slug}
        title={business.name}
      />

      <AdminPanel title={t('businessDetail')}>
        <AdminDescriptionList
          items={[
            { label: t('slug'), value: <span className="font-mono text-xs">{business.slug}</span> },
            { label: t('status'), value: <AdminStatusBadge>{business.status}</AdminStatusBadge> },
            { label: t('owner'), value: business.user?.displayName ?? 'N/A' },
            {
              label: t('phone'),
              value: <span className="font-mono text-xs">{business.user?.phone ?? 'N/A'}</span>,
            },
            { label: t('email'), value: business.user?.email ?? 'N/A' },
            { label: t('category'), value: business.category?.name ?? 'N/A' },
            { label: t('country'), value: business.country?.name ?? 'N/A' },
            { label: t('city'), value: business.city?.name ?? 'N/A' },
            {
              label: t('website'),
              value: business.website ? (
                <a
                  className="text-primary underline underline-offset-2 hover:text-primary/80"
                  href={business.website}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {business.website}
                </a>
              ) : (
                'N/A'
              ),
            },
            { label: t('description'), value: business.description ?? 'N/A' },
            { label: t('created'), value: business.createdAt.toLocaleString() },
            { label: 'Updated', value: business.updatedAt.toLocaleString() },
          ]}
        />
      </AdminPanel>

      <AdminPanel title={t('changeStatus')}>
        <BusinessStatusForm businessId={businessId} currentStatus={business.status} />
      </AdminPanel>
    </div>
  );
}
