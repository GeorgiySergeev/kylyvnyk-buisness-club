'use client';

import { CreditCard, Settings2 } from 'lucide-react';
import { useState } from 'react';

import { AdminDetailPageHeader } from '@/features/admin/components/admin-detail-page-header';
import { AdminDetailTabNav, type AdminDetailTabItem } from '@/features/admin/components/admin-detail-tab-nav';
import {
  AdminDescriptionList,
  AdminPanel,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { CardUpdateForm } from '@/features/admin/components/card-update-form';

type CardTabKey = 'controls' | 'details';

interface CardDetailTabsProps {
  backHref: string;
  backLabel: string;
  card: {
    createdAt: string;
    discountLabel: string | null;
    expiresAt: string | null;
    expiresAtInput: string | null;
    id: string;
    memberType: 'FREE' | 'BUSINESS' | 'VIP';
    number: string;
    status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'ARCHIVED';
    updatedAt: string;
  };
  controlsTitle: string;
  detailTitle: string;
  labels: Record<string, string>;
  member: {
    displayName: string | null;
    email: string | null;
    phone: string;
  };
  tabLabels: {
    controls: string;
    details: string;
  };
}

export function CardDetailTabs({
  backHref,
  backLabel,
  card,
  controlsTitle,
  detailTitle,
  labels,
  member,
  tabLabels,
}: CardDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<CardTabKey>('details');

  const tabs: AdminDetailTabItem<CardTabKey>[] = [
    { icon: CreditCard, key: 'details', label: tabLabels.details },
    { icon: Settings2, key: 'controls', label: tabLabels.controls },
  ];

  return (
    <div className="flex flex-col gap-8">
      <AdminDetailPageHeader
        backHref={backHref}
        backLabel={backLabel}
        meta={`${card.status} · ${card.memberType}`}
        subtitle={member.displayName?.trim() || 'Not set'}
        title={card.number}
        titleClassName="truncate font-mono text-sm font-medium text-ds-text"
      >
        <AdminDetailTabNav
          activeTab={activeTab}
          ariaLabel="Card sections"
          onChange={setActiveTab}
          tabs={tabs}
        />
      </AdminDetailPageHeader>

      <section className="min-w-0 space-y-6">
        {activeTab === 'details' ? (
          <AdminPanel title={detailTitle}>
            <AdminDescriptionList
              items={[
                {
                  label: labels.cardNumber,
                  value: <span className="font-mono text-xs">{card.number}</span>,
                },
                {
                  label: labels.memberType,
                  value: <AdminStatusBadge>{card.memberType}</AdminStatusBadge>,
                },
                {
                  label: labels.status,
                  value: <AdminStatusBadge>{card.status}</AdminStatusBadge>,
                },
                { label: labels.memberName, value: member.displayName?.trim() || 'Not set' },
                { label: labels.phone, value: member.phone },
                { label: labels.email, value: member.email ?? 'N/A' },
                {
                  label: labels.cardExpiresAt,
                  value: card.expiresAt ?? 'N/A',
                },
                { label: labels.created, value: card.createdAt },
                { label: 'Updated', value: card.updatedAt },
              ]}
            />
          </AdminPanel>
        ) : null}

        {activeTab === 'controls' ? (
          <AdminPanel title={controlsTitle}>
            <CardUpdateForm
              cardId={card.id}
              currentDiscountLabel={card.discountLabel}
              currentExpiresAt={card.expiresAtInput}
              currentMemberType={card.memberType}
              currentStatus={card.status}
            />
          </AdminPanel>
        ) : null}
      </section>
    </div>
  );
}
