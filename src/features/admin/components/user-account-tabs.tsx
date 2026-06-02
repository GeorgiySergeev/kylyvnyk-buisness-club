'use client';

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Handshake,
  Phone,
  Receipt,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { type AdminDetailTabItem,AdminDetailTabNav } from '@/features/admin/components/admin-detail-tab-nav';
import { AdminPanel, AdminStatusBadge } from '@/features/admin/components/admin-ui';
import { UserContactForm } from '@/features/admin/components/user-contact-form';
import { UserDangerZone } from '@/features/admin/components/user-danger-zone';
import { UserPersonalInfoForm } from '@/features/admin/components/user-personal-info-form';
import { UserRoleForm } from '@/features/admin/components/user-role-form';
import { UserRoleAssignment } from '@/features/roles/components/user-role-assignment';

type TabKey =
  | 'personal'
  | 'contact'
  | 'card'
  | 'access'
  | 'introductions'
  | 'billing'
  | 'danger'
  | 'activity';

interface SelectOption {
  id: number;
  name: string;
}

interface CardData {
  createdAt: string;
  expiresAt: string | null;
  id: string;
  memberType: string;
  number: string;
  status: string;
}

interface IntroductionData {
  businessName: string;
  clientContact: string;
  clientName: string;
  createdAt: string;
  id: string;
  message: string | null;
  status: string;
}

interface SubscriptionData {
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  currentPeriodEnd: string | null;
  id: string;
  status: string;
  stripeSubscriptionId: string;
}

interface MembershipData {
  createdAt: string;
  endsAt: string | null;
  id: string;
  planCode: string;
  startsAt: string;
  status: string;
}

interface RoleAssignmentData {
  currentRoles: {
    id: string;
    roleId: string;
    roleName: string;
    roleSlug: string;
    isSystem: boolean;
  }[];
  availableRoles: {
    id: string;
    name: string;
    slug: string;
    isSystem: boolean;
  }[];
}

interface UserAccountTabsProps {
  backHref: string;
  backLabel: string;
  card: CardData | null;
  cities: SelectOption[];
  countries: SelectOption[];
  effectiveMembershipTier: string | null;
  fallbackInitials: string;
  headerStats: {
    approvedIntroductions: number;
    cardNumber?: string;
    publishedBusinesses: number;
  };
  introductions: IntroductionData[];
  joinedDate: string;
  membershipLabel: string;
  memberships: MembershipData[];
  profile: {
    avatarUrl: string | null;
    bio: string | null;
    cityId: number | null;
    countryId: number | null;
  } | null;
  recentAuditLogs: Array<{
    action: string;
    createdAt: string;
    id: string;
    ipAddress: string | null;
  }>;
  roleAssignmentData?: RoleAssignmentData;
  subscriptions: SubscriptionData[];
  user: {
    deletedAt: string | null;
    displayName: string | null;
    email: string | null;
    id: string;
    phone: string;
    role: string;
    status: string;
  };
}

const tabs: AdminDetailTabItem<TabKey>[] = [
  { icon: UserRound, key: 'personal', label: 'Personal Info' },
  { icon: Phone, key: 'contact', label: 'Contact' },
  { icon: CreditCard, key: 'card', label: 'Club Card' },
  { icon: ShieldCheck, key: 'access', label: 'Access Control' },
  { icon: Handshake, key: 'introductions', label: 'Introductions' },
  { icon: Receipt, key: 'billing', label: 'Billing' },
  { icon: ClipboardList, key: 'activity', label: 'Activity' },
  { icon: AlertTriangle, key: 'danger', label: 'Danger Zone' },
];

export function UserAccountTabs({
  backHref,
  backLabel,
  card,
  cities,
  countries,
  effectiveMembershipTier,
  fallbackInitials,
  headerStats,
  introductions,
  joinedDate,
  membershipLabel,
  memberships,
  profile,
  recentAuditLogs,
  roleAssignmentData,
  subscriptions,
  user,
}: UserAccountTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('personal');
  const [activityPage, setActivityPage] = useState(1);

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    if (tab !== 'activity') {
      setActivityPage(1);
    }
  }

  const resolvedName = user.displayName ?? 'No display name';

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-6">
        <Link
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ds-text-muted transition-colors hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
          href={backHref}
        >
          <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
          {backLabel}
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-11 shrink-0 bg-ds-surface-2">
              {profile?.avatarUrl ? <AvatarImage alt="" src={profile.avatarUrl} /> : null}
              <AvatarFallback className="text-sm text-ds-text-muted">{fallbackInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ds-text">{resolvedName}</p>
              <p className="truncate text-xs text-ds-text-muted">{user.phone}</p>
              {user.email ? (
                <p className="truncate text-xs text-ds-text-muted">{user.email}</p>
              ) : null}
              <p className="mt-1 text-[10px] uppercase tracking-widest text-ds-text-faint">
                {user.role} · {membershipLabel} · {user.status}
                {user.deletedAt ? ' · deleted' : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ds-text-muted">
            <span>
              {headerStats.publishedBusinesses} businesses · {headerStats.approvedIntroductions}{' '}
              introductions
            </span>
            {headerStats.cardNumber ? <span>Card #{headerStats.cardNumber}</span> : null}
            <span>Joined {joinedDate}</span>
          </div>
        </div>

        <AdminDetailTabNav
          activeTab={activeTab}
          ariaLabel="User sections"
          onChange={handleTabChange}
          tabs={tabs}
        />
      </header>

      <section className="min-w-0 space-y-6">
        {activeTab === 'personal' ? (
          <AdminPanel description="Name, avatar, and bio" title="Personal Information">
            <UserPersonalInfoForm
              defaultValues={{
                avatarUrl: profile?.avatarUrl ?? null,
                bio: profile?.bio ?? null,
                displayName: user.displayName,
              }}
              userId={user.id}
            />
          </AdminPanel>
        ) : null}

        {activeTab === 'contact' ? (
          <AdminPanel description="Phone, email, and location" title="Contact Information">
            <UserContactForm
              cities={cities}
              countries={countries}
              defaultValues={{
                cityId: profile?.cityId ?? null,
                countryId: profile?.countryId ?? null,
                email: user.email,
                phone: user.phone,
              }}
              userId={user.id}
            />
          </AdminPanel>
        ) : null}

        {activeTab === 'card' ? <CardSection card={card} /> : null}

        {activeTab === 'access' ? (
          <>
            <AdminPanel
              description="Manage role, membership, and account status"
              title="Access Control"
            >
              <UserRoleForm
                currentMembershipTier={effectiveMembershipTier}
                currentRole={user.role}
                currentStatus={user.status}
                userId={user.id}
              />
            </AdminPanel>
            {roleAssignmentData ? (
              <AdminPanel
                description="Assign RBAC roles to this user"
                title="Role-Based Access Control"
              >
                <UserRoleAssignment
                  userId={user.id}
                  currentRoles={roleAssignmentData.currentRoles}
                  availableRoles={roleAssignmentData.availableRoles}
                />
              </AdminPanel>
            ) : null}
          </>
        ) : null}

        {activeTab === 'introductions' ? (
          <IntroductionsSection introductions={introductions} />
        ) : null}

        {activeTab === 'billing' ? (
          <BillingSection
            effectiveMembershipTier={effectiveMembershipTier}
            memberships={memberships}
            subscriptions={subscriptions}
          />
        ) : null}

        {activeTab === 'danger' ? (
          <AdminPanel description="Irreversible actions for this account" title="Danger Zone">
            <UserDangerZone
              deletedAt={user.deletedAt}
              userId={user.id}
              usersListHref={backHref}
            />
          </AdminPanel>
        ) : null}

        {activeTab === 'activity' ? (
          <AdminPanel description="Latest actions related to this user" title="Recent Activity">
            <ActivitySection
              logs={recentAuditLogs}
              onPageChange={setActivityPage}
              page={activityPage}
            />
          </AdminPanel>
        ) : null}
      </section>
    </div>
  );
}

function ActivitySection({
  logs,
  onPageChange,
  page,
}: {
  logs: Array<{ action: string; createdAt: string; id: string; ipAddress: string | null }>;
  onPageChange: (page: number) => void;
  page: number;
}) {
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const items = logs.slice(start, start + PAGE_SIZE);

  if (logs.length === 0) {
    return <p className="text-sm text-ds-text-muted">No activity yet.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((log) => (
          <div className="border-b border-ds-border/40 py-3 last:border-0" key={log.id}>
            <p className="text-sm font-medium text-ds-text">{log.action}</p>
            <p className="mt-1 text-xs text-ds-text-muted">
              {log.createdAt} · {log.ipAddress ?? 'N/A'}
            </p>
          </div>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-ds-text-muted">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              size="sm"
              type="button"
              variant="outline"
            >
              <ChevronLeft className="mr-1 size-4" />
              Prev
            </Button>
            <Button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              size="sm"
              type="button"
              variant="outline"
            >
              Next
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CardSection({ card }: { card: CardData | null }) {
  if (!card) {
    return (
      <AdminPanel description="Club membership card details" title="Club Card">
        <p className="text-sm text-ds-text-muted">No club card assigned.</p>
      </AdminPanel>
    );
  }

  return (
    <AdminPanel description="Club membership card details" title="Club Card">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-widest text-ds-text-faint">Card number</dt>
          <dd className="mt-1 font-mono text-sm text-ds-text">{card.number}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-ds-text-faint">Member type</dt>
          <dd className="mt-1">
            <AdminStatusBadge>{card.memberType}</AdminStatusBadge>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-ds-text-faint">Status</dt>
          <dd className="mt-1">
            <AdminStatusBadge>{card.status}</AdminStatusBadge>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-ds-text-faint">Issued</dt>
          <dd className="mt-1 text-sm text-ds-text">{card.createdAt}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-ds-text-faint">Expires</dt>
          <dd className="mt-1 text-sm text-ds-text">{card.expiresAt ?? 'No expiry'}</dd>
        </div>
      </dl>
    </AdminPanel>
  );
}

function IntroductionsSection({ introductions }: { introductions: IntroductionData[] }) {
  return (
    <AdminPanel description="All Business Introduction requests by this user" title="Introductions">
      {introductions.length === 0 ? (
        <p className="text-sm text-ds-text-muted">No introduction requests yet.</p>
      ) : (
        <div className="space-y-4">
          {introductions.map((intro) => (
            <div className="border-b border-ds-border/40 pb-4 last:border-0" key={intro.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium text-ds-text">{intro.businessName}</p>
                    <AdminStatusBadge>{intro.status}</AdminStatusBadge>
                  </div>
                  <div className="mt-2 grid gap-1 text-xs text-ds-text-muted sm:grid-cols-2">
                    <span>
                      Client: <span className="text-ds-text">{intro.clientName}</span>
                    </span>
                    <span>
                      Contact: <span className="text-ds-text">{intro.clientContact}</span>
                    </span>
                  </div>
                  {intro.message ? (
                    <p className="mt-2 text-xs leading-relaxed text-ds-text-muted">{intro.message}</p>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs text-ds-text-faint">{intro.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}

function BillingSection({
  effectiveMembershipTier,
  memberships,
  subscriptions,
}: {
  effectiveMembershipTier: string | null;
  memberships: MembershipData[];
  subscriptions: SubscriptionData[];
}) {
  return (
    <div className="space-y-6">
      {effectiveMembershipTier === 'VIP' ? (
        <p className="text-sm text-ds-text-muted">
          VIP member — recurring subscription billing is tracked below.
        </p>
      ) : null}

      <AdminPanel description="Stripe subscription records" title="Subscriptions">
        {subscriptions.length === 0 ? (
          <p className="text-sm text-ds-text-muted">No subscriptions found.</p>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <div className="border-b border-ds-border/40 pb-4 last:border-0" key={sub.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono text-xs text-ds-text-muted">{sub.stripeSubscriptionId}</p>
                  <AdminStatusBadge>{sub.status}</AdminStatusBadge>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ds-text-muted">
                  <span>
                    Started: <span className="text-ds-text">{sub.createdAt}</span>
                  </span>
                  {sub.currentPeriodEnd ? (
                    <span>
                      Period ends: <span className="text-ds-text">{sub.currentPeriodEnd}</span>
                    </span>
                  ) : null}
                  {sub.cancelAtPeriodEnd ? <span>Cancels at period end</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      <AdminPanel description="Membership plan records" title="Memberships">
        {memberships.length === 0 ? (
          <p className="text-sm text-ds-text-muted">No membership records found.</p>
        ) : (
          <div className="space-y-4">
            {memberships.map((m) => (
              <div className="border-b border-ds-border/40 pb-4 last:border-0" key={m.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-ds-text">{m.planCode}</p>
                  <AdminStatusBadge>{m.status}</AdminStatusBadge>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ds-text-muted">
                  <span>
                    Starts: <span className="text-ds-text">{m.startsAt}</span>
                  </span>
                  <span>
                    Ends: <span className="text-ds-text">{m.endsAt ?? 'No end date'}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>
    </div>
  );
}
