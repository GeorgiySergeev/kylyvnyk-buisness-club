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
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Resource } from '@/db/schema/permission';
import { type AdminDetailTabItem, AdminDetailTabNav } from '@/features/admin/components/admin-detail-tab-nav';
import { AdminPanel, AdminStatusBadge } from '@/features/admin/components/admin-ui';
import { UserContactForm } from '@/features/admin/components/user-contact-form';
import { UserDangerZone } from '@/features/admin/components/user-danger-zone';
import { UserPersonalInfoForm } from '@/features/admin/components/user-personal-info-form';
import { UserRoleForm } from '@/features/admin/components/user-role-form';
import type { PermissionSummaryRow } from '@/features/admin/lib/access-display';
import { UserPermissionOverrideEditor } from '@/features/roles/components/user-permission-override-editor';
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

interface CardHistoryData extends CardData {
  updatedAt: string;
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
    description: string | null;
    isSystem: boolean;
    permissions: PermissionSummaryRow[];
  }[];
  availableRoles: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    isSystem: boolean;
    permissions: PermissionSummaryRow[];
  }[];
  basePermissions: PermissionSummaryRow[];
  currentOverrides: {
    resource: Resource;
    denyView: boolean;
    denyCreate: boolean;
    denyEdit: boolean;
    denyDelete: boolean;
  }[];
  effectivePermissions: PermissionSummaryRow[];
}

interface UserAccountTabsProps {
  backHref: string;
  backLabel: string;
  card: CardData | null;
  cardHistory: CardHistoryData[];
  cities: SelectOption[];
  countries: SelectOption[];
  effectiveMembershipTier: string | null;
  fallbackInitials: string;
  headerStats: {
    approvedIntroductions: number;
    cardNumber?: string;
    publishedBusinesses: number;
  };
  heroLabels: {
    businesses: string;
    card: string;
    introductions: string;
    joined: string;
    notIssued: string;
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
  { icon: ShieldCheck, key: 'access', label: 'Access & Membership' },
  { icon: Handshake, key: 'introductions', label: 'Introductions' },
  { icon: Receipt, key: 'billing', label: 'Billing' },
  { icon: ClipboardList, key: 'activity', label: 'Activity' },
  { icon: AlertTriangle, key: 'danger', label: 'Danger Zone' },
];

export function UserAccountTabs({
  backHref,
  backLabel,
  card,
  cardHistory,
  cities,
  countries,
  effectiveMembershipTier,
  fallbackInitials,
  headerStats,
  heroLabels,
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
  const isMemberAccount = user.role === 'MEMBER';

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    if (tab !== 'activity') {
      setActivityPage(1);
    }
  }

  const resolvedName = user.displayName?.trim() || 'Not set';

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-4">
        <Link
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ds-text-muted transition-colors hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
          href={backHref}
        >
          <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
          {backLabel}
        </Link>

        <div className="relative overflow-hidden rounded-ds-radius-xl border border-ds-border bg-ds-surface p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ds-accent-subtle/70 to-transparent" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Avatar className="size-20 shrink-0 border border-ds-border bg-ds-surface-2 shadow-ds-shadow-sm">
              {profile?.avatarUrl ? <AvatarImage alt="" src={profile.avatarUrl} /> : null}
              <AvatarFallback className="text-xl text-ds-text-muted">{fallbackInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-2xl font-semibold tracking-tight text-ds-text">{resolvedName}</p>
              <p className="mt-1 truncate text-sm text-ds-text-muted">{user.phone}</p>
              {user.email ? (
                <p className="truncate text-xs text-ds-text-muted">{user.email}</p>
              ) : null}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <AdminStatusBadge tone={user.status === 'ACTIVE' ? 'info' : undefined}>
                  {user.status}
                </AdminStatusBadge>
                <AdminStatusBadge>{membershipLabel}</AdminStatusBadge>
                {roleAssignmentData?.currentRoles.map((role) => (
                  <AdminStatusBadge key={role.roleId} tone="info">
                    {role.roleName}
                  </AdminStatusBadge>
                ))}
                {user.deletedAt ? <AdminStatusBadge tone="danger">Deleted</AdminStatusBadge> : null}
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[28rem]">
            <UserHeroStat
              icon={<ClipboardList className="size-4" />}
              label={heroLabels.businesses}
              value={headerStats.publishedBusinesses}
            />
            <UserHeroStat
              icon={<Handshake className="size-4" />}
              label={heroLabels.introductions}
              value={headerStats.approvedIntroductions}
            />
            <UserHeroStat
              icon={<CreditCard className="size-4" />}
              label={heroLabels.card}
              value={headerStats.cardNumber ? `#${headerStats.cardNumber}` : heroLabels.notIssued}
            />
            <UserHeroStat
              icon={<UserRound className="size-4" />}
              label={heroLabels.joined}
              value={joinedDate}
            />
          </div>
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

        {activeTab === 'card' ? <CardSection card={card} history={cardHistory} /> : null}

        {activeTab === 'access' ? (
          <>
            <AdminPanel
              description="Manage account state and membership. RBAC roles are configured separately below."
              title="Access & Membership"
            >
              <UserRoleForm
                currentMembershipTier={effectiveMembershipTier}
                currentStatus={user.status}
                userId={user.id}
              />
            </AdminPanel>
            {roleAssignmentData && !isMemberAccount ? (
              <>
                <AdminPanel
                  description="Assign one or more RBAC roles and review the effective admin permissions."
                  title="RBAC Roles"
                >
                  <UserRoleAssignment
                    userId={user.id}
                    currentRoles={roleAssignmentData.currentRoles}
                    availableRoles={roleAssignmentData.availableRoles}
                  />
                </AdminPanel>
                <AdminPanel
                  description="Use deny-overrides to restrict specific actions even when an RBAC role grants them."
                  title="Personal Restrictions"
                >
                  <UserPermissionOverrideEditor
                    overrides={roleAssignmentData.currentOverrides}
                    userId={user.id}
                  />
                </AdminPanel>
                <AdminPanel
                  description="Compare role-based grants with the final permissions after personal restrictions."
                  title="Effective Permissions"
                >
                  <EffectivePermissionSection roleAssignmentData={roleAssignmentData} />
                </AdminPanel>
              </>
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

function UserHeroStat({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="rounded-ds-radius-md border border-ds-border bg-ds-bg/60 px-3 py-2.5">
      <div className="flex items-center gap-2 text-ds-text-xs font-medium uppercase tracking-[0.18em] text-ds-text-muted">
        {icon}
        {label}
      </div>
      <p className="mt-1 truncate text-ds-text-sm font-semibold text-ds-text">{value}</p>
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

function CardSection({ card, history }: { card: CardData | null; history: CardHistoryData[] }) {
  if (!card) {
    return (
      <AdminPanel description="Club membership card details" title="Club Card">
        <p className="text-sm text-ds-text-muted">No club card assigned.</p>
      </AdminPanel>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPanel description="Club membership card details" title="Current Club Card">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-widest text-ds-text-muted">Card number</dt>
            <dd className="mt-1 font-mono text-sm text-ds-text">{card.number}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-ds-text-muted">Member type</dt>
            <dd className="mt-1">
              <AdminStatusBadge>{card.memberType}</AdminStatusBadge>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-ds-text-muted">Status</dt>
            <dd className="mt-1">
              <AdminStatusBadge>{card.status}</AdminStatusBadge>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-ds-text-muted">Issued</dt>
            <dd className="mt-1 text-sm text-ds-text">{card.createdAt}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-ds-text-muted">Expires</dt>
            <dd className="mt-1 text-sm text-ds-text">{card.expiresAt ?? 'No expiry'}</dd>
          </div>
        </dl>
      </AdminPanel>

      <AdminPanel description="Archived and reissued cards remain visible for staff history." title="Card History">
        <div className="space-y-3">
          {history.map((entry) => (
            <div className="rounded-md border border-ds-border bg-ds-bg/40 px-3 py-3" key={entry.id}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-ds-text">{entry.number}</span>
                <AdminStatusBadge>{entry.memberType}</AdminStatusBadge>
                <AdminStatusBadge tone={entry.status === 'ACTIVE' ? 'info' : undefined}>
                  {entry.status}
                </AdminStatusBadge>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ds-text-muted">
                <span>Issued: {entry.createdAt}</span>
                <span>Updated: {entry.updatedAt}</span>
                <span>Expires: {entry.expiresAt ?? 'No expiry'}</span>
              </div>
            </div>
          ))}
        </div>
      </AdminPanel>
    </div>
  );
}

function EffectivePermissionSection({
  roleAssignmentData,
}: {
  roleAssignmentData: RoleAssignmentData;
}) {
  const effective = roleAssignmentData.effectivePermissions.filter(
    (permission) => permission.canView || permission.canCreate || permission.canEdit || permission.canDelete,
  );
  const overrides = roleAssignmentData.currentOverrides.filter(
    (override) => override.denyView || override.denyCreate || override.denyEdit || override.denyDelete,
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Final access</p>
        {effective.length === 0 ? (
          <p className="text-sm text-ds-text-muted">No effective admin permissions.</p>
        ) : (
          effective.map((permission) => (
            <div
              className="flex items-center justify-between gap-3 rounded-md border border-ds-border bg-ds-bg/40 px-3 py-2 text-sm"
              key={permission.resource}
            >
              <span className="font-medium text-ds-text">{permission.resource}</span>
              <span className="text-right text-xs text-ds-text-muted">{summarizePermissionRow(permission)}</span>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Restricted by personal override</p>
        {overrides.length === 0 ? (
          <p className="text-sm text-ds-text-muted">No personal restrictions.</p>
        ) : (
          overrides.map((override) => (
            <div
              className="flex items-center justify-between gap-3 rounded-md border border-ds-border bg-ds-bg/40 px-3 py-2 text-sm"
              key={override.resource}
            >
              <span className="font-medium text-ds-text">{override.resource}</span>
              <span className="text-right text-xs text-ds-text-muted">{summarizeOverrideRow(override)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function summarizePermissionRow(permission: PermissionSummaryRow) {
  const actions = [
    permission.canView ? 'view' : null,
    permission.canCreate ? 'create' : null,
    permission.canEdit ? 'edit' : null,
    permission.canDelete ? 'delete' : null,
  ].filter(Boolean);

  return actions.length > 0 ? actions.join(' / ') : 'none';
}

function summarizeOverrideRow(override: RoleAssignmentData['currentOverrides'][number]) {
  const actions = [
    override.denyView ? 'view' : null,
    override.denyCreate ? 'create' : null,
    override.denyEdit ? 'edit' : null,
    override.denyDelete ? 'delete' : null,
  ].filter(Boolean);

  return actions.length > 0 ? actions.map((action) => `deny ${action}`).join(' / ') : 'none';
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
                <span className="shrink-0 text-xs text-ds-text-muted">{intro.createdAt}</span>
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
