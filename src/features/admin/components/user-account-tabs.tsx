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
import type { ComponentType } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { AdminPanel, AdminStatusBadge } from '@/features/admin/components/admin-ui';
import { UserContactForm } from '@/features/admin/components/user-contact-form';
import { UserDangerZone } from '@/features/admin/components/user-danger-zone';
import { UserPersonalInfoForm } from '@/features/admin/components/user-personal-info-form';
import { UserRoleForm } from '@/features/admin/components/user-role-form';
import { cn } from '@/lib/utils';

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

interface UserAccountTabsProps {
  card: CardData | null;
  cities: SelectOption[];
  countries: SelectOption[];
  introductions: IntroductionData[];
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

const tabs: Array<{
  icon: ComponentType<{ className?: string }>;
  key: TabKey;
  label: string;
  section?: 'main' | 'danger';
}> = [
  { icon: UserRound, key: 'personal', label: 'Personal Info' },
  { icon: Phone, key: 'contact', label: 'Contact' },
  { icon: CreditCard, key: 'card', label: 'Club Card' },
  { icon: ShieldCheck, key: 'access', label: 'Access Control' },
  { icon: Handshake, key: 'introductions', label: 'Introductions' },
  { icon: Receipt, key: 'billing', label: 'Billing' },
  { icon: ClipboardList, key: 'activity', label: 'Activity' },
  { icon: AlertTriangle, key: 'danger', label: 'Danger Zone', section: 'danger' },
];

export function UserAccountTabs({
  card,
  cities,
  countries,
  introductions,
  memberships,
  profile,
  recentAuditLogs,
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

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-6 rounded-xl border border-border/80 bg-card/80 p-2">
          <nav aria-label="User sections" className="space-y-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              const isDanger = tab.section === 'danger';
              return (
                <button
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? isDanger
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary/15 text-primary'
                      : isDanger
                        ? 'text-destructive/70 hover:bg-destructive/5 hover:text-destructive'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  type="button"
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile horizontal pills */}
      <div className="overflow-x-auto lg:hidden">
        <nav
          aria-label="User sections"
          className="inline-flex min-w-full gap-1.5 rounded-xl border border-border/80 bg-card/70 p-1.5"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                )}
                key={`${tab.key}-mobile`}
                onClick={() => handleTabChange(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <section className="min-w-0 space-y-4 lg:col-start-2 lg:row-start-1">
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
          <AdminPanel
            description="Manage role, membership, and account status"
            title="Access Control"
          >
            <UserRoleForm
              currentMembershipTier={
                memberships.find((m) => m.status === 'ACTIVE')?.planCode ?? null
              }
              currentRole={user.role}
              currentStatus={user.status}
              userId={user.id}
            />
          </AdminPanel>
        ) : null}

        {activeTab === 'introductions' ? (
          <IntroductionsSection introductions={introductions} />
        ) : null}

        {activeTab === 'billing' ? (
          <BillingSection
            memberships={memberships}
            subscriptions={subscriptions}
          />
        ) : null}

        {activeTab === 'danger' ? (
          <AdminPanel description="Irreversible actions for this account" title="Danger Zone">
            <UserDangerZone deletedAt={user.deletedAt} userId={user.id} />
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
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {items.map((log) => (
          <div className="rounded-lg border border-border/70 bg-background/50 p-3" key={log.id}>
            <p className="text-sm font-medium text-foreground">{log.action}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {log.createdAt} &middot; {log.ipAddress ?? 'N/A'}
            </p>
          </div>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-border/70 pt-3">
          <p className="text-xs text-muted-foreground">
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

/* ─── Card Section ─────────────────────────────────────────────── */

function CardSection({ card }: { card: CardData | null }) {
  if (!card) {
    return (
      <AdminPanel description="Club membership card details" title="Club Card">
        <div className="rounded-lg border border-dashed border-border/80 bg-background/50 p-6 text-center">
          <CreditCard aria-hidden="true" className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm font-medium text-muted-foreground">No club card assigned</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create a card from the Cards management page.
          </p>
        </div>
      </AdminPanel>
    );
  }

  return (
    <AdminPanel description="Club membership card details" title="Club Card">
      <div className="rounded-lg border border-border/70 bg-background/50 p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Card Number
              </p>
              <p className="mt-0.5 font-mono text-lg font-bold tracking-wider text-foreground">
                {card.number}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Member Type
                </p>
                <div className="mt-1">
                  <AdminStatusBadge>{card.memberType}</AdminStatusBadge>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Status
                </p>
                <div className="mt-1">
                  <AdminStatusBadge>{card.status}</AdminStatusBadge>
                </div>
              </div>
            </div>
          </div>
          <CreditCard aria-hidden="true" className="size-10 text-primary/30" />
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-border/60 pt-4 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Issued</span>
            <p className="font-medium text-foreground">{card.createdAt}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Expires</span>
            <p className="font-medium text-foreground">{card.expiresAt ?? 'No expiry'}</p>
          </div>
        </div>
      </div>
    </AdminPanel>
  );
}

/* ─── Introductions Section ─────────────────────────────────────── */

function IntroductionsSection({ introductions }: { introductions: IntroductionData[] }) {
  return (
    <AdminPanel description="All Business Introduction requests by this user" title="Introductions">
      {introductions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border/80 bg-background/50 p-6 text-center">
          <Handshake aria-hidden="true" className="mx-auto size-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            No introduction requests yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {introductions.map((intro) => (
            <div className="rounded-lg border border-border/70 bg-background/50 p-4" key={intro.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {intro.businessName}
                    </p>
                    <AdminStatusBadge>{intro.status}</AdminStatusBadge>
                  </div>
                  <div className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                    <span>
                      Client: <span className="text-foreground">{intro.clientName}</span>
                    </span>
                    <span>
                      Contact: <span className="text-foreground">{intro.clientContact}</span>
                    </span>
                  </div>
                  {intro.message ? (
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {intro.message}
                    </p>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{intro.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}

/* ─── Billing Section ──────────────────────────────────────────── */

function BillingSection({
  memberships,
  subscriptions,
}: {
  memberships: MembershipData[];
  subscriptions: SubscriptionData[];
}) {
  const hasAnyData = memberships.length > 0 || subscriptions.length > 0;
  const activeTier = memberships.find((m) => m.status === 'ACTIVE')?.planCode;

  return (
    <div className="space-y-4">
      {/* VIP notice */}
      {activeTier === 'VIP' ? (
        <div className="rounded-lg border border-border/80 bg-muted/50 px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            VIP Member &mdash; Monthly subscription billing is active
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Recurring payments are tracked below via Stripe subscriptions.
          </p>
        </div>
      ) : null}

      {/* Subscriptions */}
      <AdminPanel description="Stripe subscription records" title="Subscriptions">
        {subscriptions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/80 bg-background/50 p-6 text-center">
            <Receipt aria-hidden="true" className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm font-medium text-muted-foreground">No subscriptions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div className="rounded-lg border border-border/70 bg-background/50 p-4" key={sub.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs text-muted-foreground">
                        {sub.stripeSubscriptionId}
                      </p>
                      <AdminStatusBadge>{sub.status}</AdminStatusBadge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Started: <span className="text-foreground">{sub.createdAt}</span>
                      </span>
                      {sub.currentPeriodEnd ? (
                        <span>
                          Current period ends:{' '}
                          <span className="text-foreground">{sub.currentPeriodEnd}</span>
                        </span>
                      ) : null}
                      {sub.cancelAtPeriodEnd ? (
                        <span className="font-medium text-amber-400">Cancels at period end</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      {/* Memberships */}
      <AdminPanel description="Membership plan records" title="Memberships">
        {memberships.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/80 bg-background/50 p-6 text-center">
            <CreditCard aria-hidden="true" className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              No membership records found
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {memberships.map((m) => (
              <div className="rounded-lg border border-border/70 bg-background/50 p-4" key={m.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{m.planCode}</p>
                      <AdminStatusBadge>{m.status}</AdminStatusBadge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        Starts: <span className="text-foreground">{m.startsAt}</span>
                      </span>
                      {m.endsAt ? (
                        <span>
                          Ends: <span className="text-foreground">{m.endsAt}</span>
                        </span>
                      ) : (
                        <span className="text-foreground">No end date</span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{m.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminPanel>

      {!hasAnyData && activeTier !== 'VIP' ? (
        <p className="text-center text-sm text-muted-foreground">
          No billing data available for this user.
        </p>
      ) : null}
    </div>
  );
}
