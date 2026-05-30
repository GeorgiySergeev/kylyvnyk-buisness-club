'use client';

import {
  Handshake,
  LogOut,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ComponentType } from 'react';
import { useState } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ClubCard, ClubCardPlaceholder } from '@/components/member/club-card';
import {
  DashboardDangerZone,
  DashboardQuickLink,
  DashboardSettingsRow,
  DashboardTabPanel,
} from '@/components/member/dashboard-ui';
import { Button } from '@/components/ui/button';
import { BillingPortalButton } from '@/features/billing/components/billing-portal-button';
import {
  DashboardIntroductionTab,
  type DashboardIntroductionTabLabels,
  type IntroductionFormLabels,
  type IntroductionRecentRequest,
} from '@/features/member/components/dashboard-introduction-tab';
import {
  MembershipPossibilitiesPanel,
  type MembershipPossibilitiesLabels,
} from '@/features/member/components/membership-possibilities-panel';
import type { IntroductionBusinessOption } from '@/features/introductions/components/introduction-form';
import {
  type DashboardProfileData,
  type DashboardProfileLabels,
  type SelectOption,
} from '@/features/profile/components/dashboard-profile-shared';
import { DashboardProfileSettingsForm } from '@/features/profile/components/dashboard-profile-settings-form';
import { DashboardProfileView } from '@/features/profile/components/dashboard-profile-view';
import type { MemberDashboardTab } from '@/features/member/lib/member-dashboard-tab';
import { cn } from '@/lib/utils';

interface MemberDashboardTabsProps {
  business: {
    formattedStatus: string;
    name: string;
    slug: string;
    status: string;
  } | null;
  card: {
    memberType: string;
    number: string;
    status: string;
  } | null;
  cities: SelectOption[];
  countries: SelectOption[];
  fallbackInitials: string;
  hasBillingPortal: boolean;
  initialTab: MemberDashboardTab;
  introductionBusinesses: IntroductionBusinessOption[];
  introductionFormLabels: IntroductionFormLabels;
  introductionLabels: DashboardIntroductionTabLabels;
  introductionRecentRequests: IntroductionRecentRequest[];
  isVip: boolean;
  labels: MemberDashboardLabels;
  locale: SupportedLocale;
  memberTierLabel: string;
  notSetLabel: string;
  possibilitiesLabels: MembershipPossibilitiesLabels;
  profile: DashboardProfileData;
  profileLabels: DashboardProfileLabels;
  verifyUrl: string;
  vipSubscription: {
    cancelAtPeriodEnd: boolean;
  } | null;
}

export interface MemberDashboardLabels {
  activeStatus: string;
  billingPortalError: string;
  billingPortalPending: string;
  businessDescription: string;
  businessIntroduction: string;
  businessSubmittedDescription: string;
  businessTitle: string;
  businessVipReadyDescription: string;
  businessVipRequiredDescription: string;
  cancelVipCta: string;
  cancelVipDescription: string;
  cancelVipError: string;
  cancelVipPending: string;
  cancelVipScheduled: string;
  cancelVipTitle: string;
  cardDescription: string;
  cardMissingDescription: string;
  cardMissingTitle: string;
  cardTitle: string;
  featuresDescription: string;
  featuresTitle: string;
  introductionsDescription: string;
  introductionsRestricted: string;
  introductionsTitle: string;
  noBusinessTitle: string;
  noIntroductions: string;
  openDirectory: string;
  profileDescription: string;
  profileTitle: string;
  quickActionsDescription: string;
  quickActionsTitle: string;
  settingsBillingPortal: string;
  settingsDeleteAccountDescription: string;
  settingsDeleteAccountTitle: string;
  settingsDangerZoneTitle: string;
  settingsDescription: string;
  settingsNotificationsComingSoon: string;
  settingsNotificationsTitle: string;
  settingsSignOut: string;
  settingsTitle: string;
  status: string;
  submitBusinessCta: string;
  subscriptionDescription: string;
  subscriptionTitle: string;
  tabFeatures: string;
  tabIntroduction: string;
  tabProfile: string;
  tabSettings: string;
  upgradeVipCta: string;
  upgradeVipDescription: string;
  upgradeVipError: string;
  upgradeVipPending: string;
  upgradeVipTitle: string;
  verifyCard: string;
  viewPublicProfile: string;
}

const tabs: Array<{
  icon: ComponentType<{ className?: string }>;
  key: MemberDashboardTab;
  labelKey: keyof Pick<
    MemberDashboardLabels,
    'tabFeatures' | 'tabIntroduction' | 'tabProfile' | 'tabSettings'
  >;
  styles: {
    active: string;
    icon: string;
    idle: string;
  };
}> = [
  {
    icon: UserRound,
    key: 'profile',
    labelKey: 'tabProfile',
    styles: {
      active: 'border-primary/60 bg-primary/15 ring-1 ring-primary/30',
      icon: 'bg-primary/25 text-primary',
      idle: 'border-border/50 bg-white/5 hover:border-primary/40 hover:bg-primary/10',
    },
  },
  {
    icon: Sparkles,
    key: 'features',
    labelKey: 'tabFeatures',
    styles: {
      active: 'border-violet-500/60 bg-violet-500/15 ring-1 ring-violet-500/30',
      icon: 'bg-violet-500/25 text-violet-300',
      idle: 'border-border/50 bg-white/5 hover:border-violet-500/40 hover:bg-violet-500/10',
    },
  },
  {
    icon: Handshake,
    key: 'introduction',
    labelKey: 'tabIntroduction',
    styles: {
      active: 'border-teal-500/60 bg-teal-500/15 ring-1 ring-teal-500/30',
      icon: 'bg-teal-500/25 text-teal-300',
      idle: 'border-border/50 bg-white/5 hover:border-teal-500/40 hover:bg-teal-500/10',
    },
  },
  {
    icon: Settings,
    key: 'settings',
    labelKey: 'tabSettings',
    styles: {
      active: 'border-amber-500/60 bg-amber-500/15 ring-1 ring-amber-500/30',
      icon: 'bg-amber-500/25 text-amber-300',
      idle: 'border-border/50 bg-white/5 hover:border-amber-500/40 hover:bg-amber-500/10',
    },
  },
];

function resolveActiveTabDescription(tab: MemberDashboardTab, labels: MemberDashboardLabels) {
  switch (tab) {
    case 'profile':
      return labels.profileDescription;
    case 'features':
      return labels.featuresDescription;
    case 'introduction':
      return labels.introductionsDescription;
    case 'settings':
      return labels.settingsDescription;
  }
}

function resolveActiveTabTitle(tab: MemberDashboardTab, labels: MemberDashboardLabels) {
  switch (tab) {
    case 'profile':
      return labels.profileTitle;
    case 'features':
      return labels.featuresTitle;
    case 'introduction':
      return labels.introductionsTitle;
    case 'settings':
      return labels.settingsTitle;
  }
}

export function MemberDashboardTabs({
  business,
  card,
  cities,
  countries,
  fallbackInitials,
  hasBillingPortal,
  initialTab,
  introductionBusinesses,
  introductionFormLabels,
  introductionLabels,
  introductionRecentRequests,
  isVip,
  labels,
  locale,
  memberTierLabel,
  notSetLabel,
  possibilitiesLabels,
  profile,
  profileLabels,
  verifyUrl,
  vipSubscription,
}: MemberDashboardTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<MemberDashboardTab>(initialTab);

  function handleTabChange(tab: MemberDashboardTab) {
    setActiveTab(tab);
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  }

  const resolvedName = profile.displayName ?? notSetLabel;
  const resolvedContact = profile.email ?? profile.phone;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <aside className="w-full shrink-0 lg:w-[17.5rem] xl:w-[19rem]">
        <div className="sticky top-6 space-y-5 rounded-xl border border-border/50 bg-card/30 p-4 sm:p-5">
          <div className="flex items-center gap-3 border-b border-border/50 pb-4">
            <Avatar className="size-12 shrink-0 border border-border/50 bg-white/5">
              <AvatarImage alt="" src={profile.avatarUrl ?? undefined} />
              <AvatarFallback className="text-sm text-fg/60">{fallbackInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{resolvedName}</p>
              <p className="truncate text-xs text-fg/50">{resolvedContact}</p>
              <span className="mt-1.5 inline-flex max-w-full items-center rounded-md border border-primary/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary">
                {memberTierLabel}
              </span>
            </div>
          </div>

          <nav aria-label="Dashboard sections" className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                    isActive ? cn(tab.styles.active, 'text-white') : cn(tab.styles.idle, 'text-fg/55'),
                  )}
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  type="button"
                >
                  <span
                    className={cn(
                      'inline-flex size-9 items-center justify-center rounded-lg',
                      tab.styles.icon,
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  <span className="leading-tight">{labels[tab.labelKey]}</span>
                </button>
              );
            })}
          </nav>

          <ul className="space-y-0.5 border-t border-border/50 pt-4">
            <li>
              <Link
                className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-sm text-fg/55 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href={localizeHref(locale, '/directory')}
              >
                {labels.openDirectory}
              </Link>
            </li>
            <li>
              <Link
                className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-sm text-fg/55 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href={verifyUrl}
              >
                {labels.verifyCard}
              </Link>
            </li>
          </ul>

          <div className="border-t border-border/50 pt-4">
            <Link
              className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={localizeHref(locale, '/sign-out')}
            >
              <LogOut aria-hidden="true" className="size-4 shrink-0" />
              {labels.settingsSignOut}
            </Link>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-4 lg:hidden">
          <nav
            aria-label="Dashboard sections"
            className="inline-flex w-full gap-1.5 overflow-x-auto rounded-xl border border-border/50 bg-card/30 p-1.5"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                    isActive
                      ? 'bg-white text-black'
                      : 'text-fg/50 hover:bg-white/5 hover:text-white',
                  )}
                  key={`${tab.key}-mobile`}
                  onClick={() => handleTabChange(tab.key)}
                  type="button"
                >
                  {labels[tab.labelKey]}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="rounded-xl border border-border/50 bg-card/30">
          <header className="border-b border-border/50 px-5 py-5 sm:px-8 sm:py-6">
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              {resolveActiveTabTitle(activeTab, labels)}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg/50">
              {resolveActiveTabDescription(activeTab, labels)}
            </p>
          </header>

          <div className="space-y-6 p-5 sm:p-8">
            {activeTab === 'profile' ? (
              <>
                <DashboardTabPanel
                  embedded
                  description={labels.profileDescription}
                  title={labels.profileTitle}
                >
                  <DashboardProfileView labels={profileLabels} {...profile} />
                </DashboardTabPanel>

                <DashboardTabPanel embedded description={labels.cardDescription} title={labels.cardTitle}>
                  {card ? (
                    <ClubCard
                      cardNumber={card.number}
                      memberName={profile.displayName ?? 'Member'}
                      memberType={card.memberType}
                      status={card.status}
                      verifyUrl={verifyUrl}
                    />
                  ) : (
                    <ClubCardPlaceholder
                      description={labels.cardMissingDescription}
                      title={labels.cardMissingTitle}
                    />
                  )}
                </DashboardTabPanel>

                <DashboardTabPanel
                  embedded
                  description={labels.quickActionsDescription}
                  title={labels.quickActionsTitle}
                >
                  <div className="flex flex-wrap gap-6">
                    <DashboardQuickLink
                      href={localizeHref(locale, '/directory')}
                      label={labels.openDirectory}
                    />
                    <DashboardQuickLink href={verifyUrl} label={labels.verifyCard} />
                  </div>
                </DashboardTabPanel>
              </>
            ) : null}

            {activeTab === 'features' ? (
              <MembershipPossibilitiesPanel
                business={
                  business
                    ? {
                        slug: business.slug,
                        status: business.status,
                      }
                    : null
                }
                cancelAtPeriodEnd={vipSubscription?.cancelAtPeriodEnd ?? false}
                hidePageHeader
                isVip={isVip}
                labels={possibilitiesLabels}
                locale={locale}
              />
            ) : null}

            {activeTab === 'introduction' ? (
              <DashboardIntroductionTab
                businesses={introductionBusinesses}
                formLabels={introductionFormLabels}
                isVip={isVip}
                labels={introductionLabels}
                locale={locale}
                recentRequests={introductionRecentRequests}
              />
            ) : null}

            {activeTab === 'settings' ? (
              <>
                <DashboardTabPanel
                  embedded
                  description={labels.settingsDescription}
                  title={labels.settingsTitle}
                >
                  <DashboardProfileSettingsForm
                    cities={cities}
                    countries={countries}
                    labels={profileLabels}
                    locale={locale}
                    {...profile}
                  />
                </DashboardTabPanel>

                <DashboardTabPanel embedded title={labels.settingsTitle}>
                  <div className="divide-y divide-border/50">
                    {isVip && hasBillingPortal ? (
                      <DashboardSettingsRow
                        description={labels.subscriptionDescription}
                        title={labels.settingsBillingPortal}
                        action={
                          <BillingPortalButton
                            errorLabel={labels.billingPortalError}
                            labels={{
                              cta: labels.settingsBillingPortal,
                              pending: labels.billingPortalPending,
                            }}
                            locale={locale}
                          />
                        }
                      />
                    ) : null}

                    <DashboardSettingsRow
                      description={labels.settingsNotificationsComingSoon}
                      title={labels.settingsNotificationsTitle}
                      action={
                        <Button
                          type="button"
                          variant="outline"
                          className="min-h-11 rounded-md border-border/50 bg-transparent text-fg/40"
                          disabled
                        >
                          {labels.settingsNotificationsComingSoon}
                        </Button>
                      }
                    />
                  </div>

                  <div className="mt-6">
                    <DashboardDangerZone
                      description={labels.settingsDeleteAccountDescription}
                      title={labels.settingsDeleteAccountTitle}
                      zoneLabel={labels.settingsDangerZoneTitle}
                      action={
                        <Link
                          className="inline-flex min-h-11 items-center rounded-md border border-destructive/40 bg-destructive/10 px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          href={localizeHref(locale, '/legal/contact')}
                        >
                          {labels.settingsDeleteAccountTitle}
                        </Link>
                      }
                    />
                  </div>
                </DashboardTabPanel>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
