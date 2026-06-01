'use client';

import {
  Compass,
  CreditCard,
  Handshake,
  LogOut,
  type LucideIcon,
  Settings,
  Sparkles,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { ClubCard, ClubCardPlaceholder } from '@/components/member/club-card';
import {
  DashboardDangerZone,
  DashboardQuickLink,
  DashboardSettingsRow,
  DashboardTabPanel,
} from '@/components/member/dashboard-ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BillingPortalButton } from '@/features/billing/components/billing-portal-button';
import { CancelVipButton } from '@/features/billing/components/cancel-vip-button';
import type { IntroductionBusinessOption } from '@/features/introductions/components/introduction-form';
import {
  DashboardIntroductionTab,
  type DashboardIntroductionTabLabels,
  type IntroductionFormLabels,
  type IntroductionRecentRequest,
} from '@/features/member/components/dashboard-introduction-tab';
import {
  type MembershipPossibilitiesLabels,
  MembershipPossibilitiesPanel,
} from '@/features/member/components/membership-possibilities-panel';
import {
  isMemberDashboardTab,
  type MemberDashboardTab,
} from '@/features/member/lib/member-dashboard-tab';
import { DashboardProfileSettingsForm } from '@/features/profile/components/dashboard-profile-settings-form';
import {
  type DashboardProfileData,
  type DashboardProfileLabels,
  type SelectOption,
} from '@/features/profile/components/dashboard-profile-shared';
import { DashboardProfileView } from '@/features/profile/components/dashboard-profile-view';
import { cn } from '@/lib/utils';

function resolveTabFromUrl(tabParam: string | null, fallback: MemberDashboardTab): MemberDashboardTab {
  return isMemberDashboardTab(tabParam) ? tabParam : fallback;
}

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
  membershipStatusDescription: string | null;
  notSetLabel: string;
  possibilitiesLabels: MembershipPossibilitiesLabels;
  profile: DashboardProfileData;
  profileLabels: DashboardProfileLabels;
  showWelcomeModal?: boolean;
  verifyUrl: string;
  vipSubscription: {
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: Date | null;
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
  subscriptionPeriodEnd: string;
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
  welcomeModalDescription: string;
  welcomeModalTitle: string;
}

const tabs: Array<{
  icon: LucideIcon;
  key: MemberDashboardTab;
  labelKey: keyof Pick<
    MemberDashboardLabels,
    'tabFeatures' | 'tabIntroduction' | 'tabProfile' | 'tabSettings'
  >;
}> = [
  { icon: UserRound, key: 'profile', labelKey: 'tabProfile' },
  { icon: Sparkles, key: 'features', labelKey: 'tabFeatures' },
  { icon: Handshake, key: 'introduction', labelKey: 'tabIntroduction' },
  { icon: Settings, key: 'settings', labelKey: 'tabSettings' },
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
  membershipStatusDescription,
  notSetLabel,
  possibilitiesLabels,
  profile,
  profileLabels,
  showWelcomeModal = false,
  verifyUrl,
  vipSubscription,
}: MemberDashboardTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<MemberDashboardTab>(() =>
    resolveTabFromUrl(searchParams.get('tab'), initialTab),
  );
  const [welcomeOpen, setWelcomeOpen] = useState(showWelcomeModal);

  useEffect(() => {
    setActiveTab(resolveTabFromUrl(searchParams.get('tab'), initialTab));
  }, [searchParams, initialTab]);

  useEffect(() => {
    setWelcomeOpen(showWelcomeModal);
  }, [showWelcomeModal]);

  function handleWelcomeOpenChange(nextOpen: boolean) {
    setWelcomeOpen(nextOpen);
    if (nextOpen) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete('welcome');
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    window.history.replaceState(null, '', url);
  }

  function handleTabChange(tab: MemberDashboardTab) {
    setActiveTab(tab);
    window.history.replaceState(null, '', `${pathname}?tab=${tab}`);
  }

  const resolvedName = profile.displayName ?? notSetLabel;
  const resolvedContact = profile.email ?? profile.phone;
  const subscriptionPeriodEndLabel = vipSubscription?.currentPeriodEnd
    ? `${labels.subscriptionPeriodEnd}: ${new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(vipSubscription.currentPeriodEnd)}`
    : null;

  return (
    <div className="flex flex-col gap-8">
      <Dialog open={welcomeOpen} onOpenChange={handleWelcomeOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{labels.welcomeModalTitle}</DialogTitle>
            <DialogDescription>{labels.welcomeModalDescription}</DialogDescription>
          </DialogHeader>
          <div className="mt-2">
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
          </div>
        </DialogContent>
      </Dialog>

      <header className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-11 shrink-0 bg-white/5">
              <AvatarImage alt="" src={profile.avatarUrl ?? undefined} />
              <AvatarFallback className="text-sm text-ds-text-muted">{fallbackInitials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ds-text">{resolvedName}</p>
              <p className="truncate text-xs text-ds-text-muted">{resolvedContact}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge className="uppercase tracking-[0.12em] text-ds-accent" variant="outline">
                  {memberTierLabel}
                </Badge>
                {membershipStatusDescription ? (
                  <span className="text-xs text-ds-text-muted">{membershipStatusDescription}</span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:justify-end">
            <Link
              className="inline-flex min-h-11 items-center gap-2 text-sm text-ds-text-muted transition-colors hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
              href={localizeHref(locale, '/directory')}
            >
              <Compass aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.5} />
              <span>{labels.openDirectory}</span>
            </Link>
            <Link
              className="inline-flex min-h-11 items-center gap-2 text-sm text-ds-text-muted transition-colors hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
              href={verifyUrl}
            >
              <CreditCard aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.5} />
              <span>{labels.verifyCard}</span>
            </Link>
            <Link
              className="inline-flex min-h-11 items-center gap-2 text-sm text-ds-text-muted transition-colors hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
              href={localizeHref(locale, '/sign-out')}
            >
              <LogOut aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.5} />
              <span>{labels.settingsSignOut}</span>
            </Link>
          </div>
        </div>

        <nav
          aria-label="Dashboard sections"
          className="flex gap-6 overflow-x-auto [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 shrink-0 items-center gap-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none',
                  isActive
                    ? 'font-medium text-ds-text'
                    : 'text-ds-text-muted hover:text-ds-text',
                )}
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                type="button"
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.5} />
                <span className="whitespace-nowrap">{labels[tab.labelKey]}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <div className="min-w-0">
        <div>
          {activeTab === 'profile' ? (
            <div className="mb-8 max-w-md">
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
            </div>
          ) : (
            <header className="mb-6">
              <h2 className="text-lg font-medium text-ds-text sm:text-xl">
                {resolveActiveTabTitle(activeTab, labels)}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ds-text-muted">
                {resolveActiveTabDescription(activeTab, labels)}
              </p>
            </header>
          )}

          <div className="space-y-8">
            {activeTab === 'profile' ? (
              <>
                <DashboardProfileView labels={profileLabels} {...profile} />

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
                        formattedStatus: business.formattedStatus,
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
                  {isVip && vipSubscription ? (
                    <CancelVipButton
                      cancelAtPeriodEnd={vipSubscription.cancelAtPeriodEnd}
                      labels={{
                        cta: labels.cancelVipCta,
                        description: labels.cancelVipDescription,
                        error: labels.cancelVipError,
                        pending: labels.cancelVipPending,
                        scheduled: labels.cancelVipScheduled,
                        title: labels.cancelVipTitle,
                      }}
                      locale={locale}
                      periodEndLabel={subscriptionPeriodEndLabel}
                    />
                  ) : null}

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
