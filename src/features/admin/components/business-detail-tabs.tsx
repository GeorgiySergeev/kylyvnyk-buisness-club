'use client';

import { Building2, Settings2, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

import { AdminDetailPageHeader } from '@/features/admin/components/admin-detail-page-header';
import { AdminDetailTabNav, type AdminDetailTabItem } from '@/features/admin/components/admin-detail-tab-nav';
import {
  AdminDescriptionList,
  AdminPanel,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { BusinessAdminControls } from '@/features/admin/components/business-admin-controls';
import { BusinessStatusForm } from '@/features/admin/components/business-status-form';

type BusinessTabKey = 'controls' | 'overview' | 'status';

interface BusinessDetailTabsProps {
  backHref: string;
  backLabel: string;
  business: {
    categoryName: string | null;
    cityName: string | null;
    countryName: string | null;
    createdAt: string;
    description: string | null;
    email: string | null;
    id: string;
    isDeleted: boolean;
    isRecommended: boolean;
    isTopPartner: boolean;
    name: string;
    ownerEmail: string | null;
    ownerName: string | null;
    ownerPhone: string | null;
    phone: string | null;
    slug: string;
    status: string;
    updatedAt: string;
    website: string | null;
  };
  changeStatusLabel: string;
  controlsTitle: string;
  detailTitle: string;
  labels: Record<string, string>;
  tabLabels: {
    controls: string;
    overview: string;
    status: string;
  };
}

const tabIcons = {
  controls: Settings2,
  overview: Building2,
  status: SlidersHorizontal,
} as const;

export function BusinessDetailTabs({
  backHref,
  backLabel,
  business,
  changeStatusLabel,
  controlsTitle,
  detailTitle,
  labels,
  tabLabels,
}: BusinessDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<BusinessTabKey>('overview');

  const tabs: AdminDetailTabItem<BusinessTabKey>[] = [
    { icon: tabIcons.overview, key: 'overview', label: tabLabels.overview },
    { icon: tabIcons.status, key: 'status', label: tabLabels.status },
    { icon: tabIcons.controls, key: 'controls', label: tabLabels.controls },
  ];

  const meta = [
    business.status,
    business.isDeleted ? 'deleted' : null,
    business.isTopPartner ? 'top partner' : null,
    business.isRecommended ? 'recommended' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex flex-col gap-8">
      <AdminDetailPageHeader
        backHref={backHref}
        backLabel={backLabel}
        meta={meta}
        subtitle={business.slug}
        title={business.name}
      >
        <AdminDetailTabNav
          activeTab={activeTab}
          ariaLabel="Business sections"
          onChange={setActiveTab}
          tabs={tabs}
        />
      </AdminDetailPageHeader>

      <section className="min-w-0 space-y-6">
        {activeTab === 'overview' ? (
          <AdminPanel title={detailTitle}>
            <AdminDescriptionList
              items={[
                { label: labels.slug, value: <span className="font-mono text-xs">{business.slug}</span> },
                { label: labels.status, value: <AdminStatusBadge>{business.status}</AdminStatusBadge> },
                { label: labels.owner, value: business.ownerName ?? 'N/A' },
                {
                  label: labels.phone,
                  value: <span className="font-mono text-xs">{business.ownerPhone ?? 'N/A'}</span>,
                },
                { label: labels.email, value: business.ownerEmail ?? 'N/A' },
                { label: labels.category, value: business.categoryName ?? 'N/A' },
                { label: labels.country, value: business.countryName ?? 'N/A' },
                { label: labels.city, value: business.cityName ?? 'N/A' },
                {
                  label: labels.website,
                  value: business.website ? (
                    <a
                      className="text-ds-text underline underline-offset-2 hover:text-ds-text-muted"
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
                { label: labels.description, value: business.description ?? 'N/A' },
                { label: labels.created, value: business.createdAt },
                { label: 'Updated', value: business.updatedAt },
              ]}
            />
          </AdminPanel>
        ) : null}

        {activeTab === 'status' ? (
          <AdminPanel title={changeStatusLabel}>
            <BusinessStatusForm businessId={business.id} currentStatus={business.status} />
          </AdminPanel>
        ) : null}

        {activeTab === 'controls' ? (
          <AdminPanel title={controlsTitle}>
            <BusinessAdminControls
              businessId={business.id}
              isDeleted={business.isDeleted}
              isRecommended={business.isRecommended}
              isTopPartner={business.isTopPartner}
            />
          </AdminPanel>
        ) : null}
      </section>
    </div>
  );
}
