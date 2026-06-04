'use client';

import { ClipboardList, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { AdminDetailPageHeader } from '@/features/admin/components/admin-detail-page-header';
import { type AdminDetailTabItem,AdminDetailTabNav } from '@/features/admin/components/admin-detail-tab-nav';
import {
  AdminDescriptionList,
  AdminPanel,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { IntroductionModerationForm } from '@/features/introductions/components/introduction-moderation-form';

type IntroductionTabKey = 'moderation' | 'overview';

interface IntroductionModerationLabels {
  adminNotePlaceholder: string;
  approve: string;
  reject: string;
  save: string;
  statusUpdated: string;
  underReview: string;
  updateError: string;
}

interface IntroductionDetailTabsProps {
  backHref: string;
  backLabel: string;
  introduction: {
    adminNote: string | null;
    clientContact: string;
    clientName: string;
    createdAt: string;
    id: string;
    message: string | null;
    status: string;
    updatedAt: string;
  };
  labels: Record<string, string>;
  moderationLabels: IntroductionModerationLabels;
  requester: {
    displayName: string | null;
    href: string;
    phone: string;
  } | null;
  tabLabels: {
    moderation: string;
    overview: string;
  };
  targetBusiness: {
    href: string;
    location: string | null;
    name: string;
  } | null;
}

export function IntroductionDetailTabs({
  backHref,
  backLabel,
  introduction,
  labels,
  moderationLabels,
  requester,
  tabLabels,
  targetBusiness,
}: IntroductionDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<IntroductionTabKey>('overview');

  const tabs: AdminDetailTabItem<IntroductionTabKey>[] = [
    { icon: ClipboardList, key: 'overview', label: tabLabels.overview },
    { icon: SlidersHorizontal, key: 'moderation', label: tabLabels.moderation },
  ];

  const meta = [introduction.status, introduction.createdAt].filter(Boolean).join(' · ');

  return (
    <div className="flex flex-col gap-8">
      <AdminDetailPageHeader
        backHref={backHref}
        backLabel={backLabel}
        meta={meta}
        subtitle={targetBusiness?.name ?? 'N/A'}
        title={introduction.clientName}
      >
        <AdminDetailTabNav
          activeTab={activeTab}
          ariaLabel="Introduction sections"
          onChange={setActiveTab}
          tabs={tabs}
        />
      </AdminDetailPageHeader>

      <section className="min-w-0 space-y-6">
        {activeTab === 'overview' ? (
          <AdminPanel title={tabLabels.overview}>
            <AdminDescriptionList
              items={[
                {
                  label: labels.status,
                  value: <AdminStatusBadge>{introduction.status}</AdminStatusBadge>,
                },
                {
                  label: labels.business,
                  value: targetBusiness ? (
                    <Link
                      className="text-ds-text underline underline-offset-2 hover:text-ds-text-muted"
                      href={targetBusiness.href}
                    >
                      {targetBusiness.name}
                    </Link>
                  ) : (
                    'N/A'
                  ),
                },
                {
                  label: labels.location,
                  value: targetBusiness?.location ?? 'N/A',
                },
                {
                  label: labels.requester,
                  value: requester ? (
                    <span>
                      <Link
                        className="text-ds-text underline underline-offset-2 hover:text-ds-text-muted"
                        href={requester.href}
                      >
                        {requester.displayName ?? 'N/A'}
                      </Link>
                      <span className="ml-1 font-mono text-xs text-ds-text-muted">
                        {requester.phone}
                      </span>
                    </span>
                  ) : (
                    'N/A'
                  ),
                },
                { label: labels.client, value: introduction.clientName },
                {
                  label: labels.clientContact,
                  value: (
                    <span className="font-mono text-xs">{introduction.clientContact}</span>
                  ),
                },
                { label: labels.message, value: introduction.message ?? 'N/A' },
                {
                  label: labels.adminNote,
                  value: introduction.adminNote ?? 'N/A',
                },
                { label: labels.created, value: introduction.createdAt },
                { label: labels.updated, value: introduction.updatedAt },
              ]}
            />
          </AdminPanel>
        ) : null}

        {activeTab === 'moderation' ? (
          <AdminPanel title={tabLabels.moderation}>
            <IntroductionModerationForm
              currentNote={introduction.adminNote}
              currentStatus={introduction.status}
              introductionId={introduction.id}
              labels={moderationLabels}
            />
          </AdminPanel>
        ) : null}
      </section>
    </div>
  );
}
