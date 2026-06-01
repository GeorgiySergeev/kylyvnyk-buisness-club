import { and, desc, eq, isNull } from 'drizzle-orm';
import dynamic from 'next/dynamic';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { businesses, cities, clubCards, countries, introductions, memberships } from '@/db/schema';
import { guardOnboarded } from '@/features/auth/lib/role-guards';
import { MemberDashboardSkeleton } from '@/features/member/components/member-dashboard-skeleton';
import { isMemberDashboardTab } from '@/features/member/lib/member-dashboard-tab';
import { getInitials } from '@/features/profile/components/dashboard-profile-shared';
import {
  getCachedCities,
  getCachedCountries,
  getCachedPublishedBusinessOptions,
} from '@/lib/db/reference-data';
import { env } from '@/lib/env';
import { getT } from '@/lib/i18n/t-server';
import { VIP_PLAN_CODE } from '@/lib/stripe/config';

const MemberDashboardTabs = dynamic(
  () =>
    import('@/features/member/components/member-dashboard-tabs').then(
      (module) => module.MemberDashboardTabs,
    ),
  { loading: () => <MemberDashboardSkeleton /> },
);

interface MemberDashboardPageContentProps {
  locale: SupportedLocale;
  showWelcomeModal?: boolean;
  tab?: string;
}

function formatBusinessStatus(status: string, t: ReturnType<typeof getT<'dashboard'>>) {
  switch (status) {
    case 'PENDING':
      return t('businessStatusPending');
    case 'PUBLISHED':
      return t('businessStatusPublished');
    case 'HIDDEN':
      return t('businessStatusHidden');
    case 'DRAFT':
      return t('businessStatusDraft');
    default:
      return status;
  }
}

function resolveMemberTierLabel(
  memberType: string | undefined,
  isVip: boolean,
  t: ReturnType<typeof getT<'dashboard'>>,
) {
  if (memberType === 'BUSINESS') {
    return t('memberTierBusiness');
  }
  if (isVip || memberType === 'VIP') {
    return t('memberTierVip');
  }
  return t('memberTierFree');
}

function isActiveVipMembership(
  membership: { endsAt: Date | null; status: string } | null | undefined,
): boolean {
  if (!membership || membership.status !== 'ACTIVE') {
    return false;
  }

  if (membership.endsAt && membership.endsAt.getTime() < Date.now()) {
    return false;
  }

  return true;
}

export async function MemberDashboardPageContent({
  locale,
  showWelcomeModal = false,
  tab,
}: MemberDashboardPageContentProps) {
  const user = await guardOnboarded(locale);
  const profile = user.profile;
  const t = getT('dashboard', locale);
  const tIntro = getT('introductions', locale);

  const [card, allCountries, allCities, publishedBusinesses, introductionRecentRows, business, vipSubscription, vipMembership] =
    await Promise.all([
      db.query.clubCards.findFirst({
        where: eq(clubCards.userId, user.id),
      }),
      getCachedCountries(),
      getCachedCities(),
      getCachedPublishedBusinessOptions(),
      db
        .select({
          businessName: businesses.name,
          cityName: cities.name,
          countryName: countries.name,
          createdAt: introductions.createdAt,
          id: introductions.id,
          status: introductions.status,
        })
        .from(introductions)
        .innerJoin(
          businesses,
          and(
            eq(introductions.targetBusinessId, businesses.id),
            eq(businesses.status, 'PUBLISHED'),
            isNull(businesses.deletedAt),
          ),
        )
        .leftJoin(cities, eq(businesses.cityId, cities.id))
        .leftJoin(countries, eq(businesses.countryId, countries.id))
        .where(eq(introductions.requesterId, user.id))
        .orderBy(desc(introductions.createdAt))
        .limit(5),
      db.query.businesses.findFirst({
        where: and(eq(businesses.userId, user.id), isNull(businesses.deletedAt)),
      }),
      db.query.stripeSubscriptions.findFirst({
        where: (table, { and, eq }) => and(eq(table.userId, user.id), eq(table.planCode, VIP_PLAN_CODE)),
        orderBy: (table, { desc }) => [desc(table.updatedAt)],
      }),
      db.query.memberships.findFirst({
        where: and(
          eq(memberships.userId, user.id),
          eq(memberships.planCode, VIP_PLAN_CODE),
          isNull(memberships.deletedAt),
        ),
        orderBy: [desc(memberships.updatedAt)],
      }),
    ]);

  const isVip = isActiveVipMembership(vipMembership);

  const introductionBusinesses = publishedBusinesses.map((item) => ({
    category: item.category?.name ?? null,
    city: item.city?.name ?? null,
    country: item.country?.name ?? null,
    id: item.id,
    name: item.name,
  }));

  const verifyUrl = card
    ? `${env.NEXT_PUBLIC_APP_URL}/${locale}/verify-card/${card.number}`
    : localizeHref(locale, '/verify-card');

  const profileLabels = {
    avatarHint: t('avatarHint'),
    bio: t('bio'),
    bioHint: t('bioHint'),
    cancelEdit: t('cancelEdit'),
    city: t('city'),
    country: t('country'),
    displayName: t('displayName'),
    editProfile: t('editProfile'),
    email: t('email'),
    notSet: t('notSet'),
    optional: t('optional'),
    phone: t('phone'),
    phoneReadOnly: t('phoneReadOnly'),
    profileAvatarError: t('profileAvatarError'),
    profileDescription: t('profileDescription'),
    profileEmailInUse: t('profileEmailInUse'),
    profileFormError: t('profileFormError'),
    profilePicture: t('profilePicture'),
    profileTitle: t('profileTitle'),
    saveProfile: t('saveProfile'),
    uploadAvatar: t('uploadAvatar'),
  };

  const labels = {
    activeStatus: t('activeStatus'),
    billingPortalError: t('billingPortalError'),
    billingPortalPending: t('settingsBillingPortalPending'),
    businessDescription: t('businessDescription'),
    businessIntroduction: t('businessIntroduction'),
    businessSubmittedDescription: t('businessSubmittedDescription'),
    businessTitle: t('businessTitle'),
    businessVipReadyDescription: t('businessVipReadyDescription'),
    businessVipRequiredDescription: t('businessVipRequiredDescription'),
    cancelVipCta: t('cancelVipCta'),
    cancelVipDescription: t('cancelVipDescription'),
    cancelVipError: t('cancelVipError'),
    cancelVipPending: t('cancelVipPending'),
    cancelVipScheduled: t('cancelVipScheduled'),
    cancelVipTitle: t('cancelVipTitle'),
    cardDescription: t('cardDescription'),
    cardMissingDescription: t('cardMissingDescription'),
    cardMissingTitle: t('cardMissingTitle'),
    cardTitle: t('cardTitle'),
    featuresDescription: t('featuresDescription'),
    featuresTitle: t('featuresTitle'),
    introductionsDescription: t('introductionsDescription'),
    introductionsRestricted: t('introductionsRestricted'),
    introductionsTitle: t('introductionsTitle'),
    noBusinessTitle: t('noBusinessTitle'),
    noIntroductions: t('noIntroductions'),
    openDirectory: t('openDirectory'),
    profileDescription: t('profileDescription'),
    profileTitle: t('profileTitle'),
    quickActionsDescription: t('quickActionsDescription'),
    quickActionsTitle: t('quickActionsTitle'),
    settingsBillingPortal: t('settingsBillingPortal'),
    settingsDeleteAccountDescription: t('settingsDeleteAccountDescription'),
    settingsDeleteAccountTitle: t('settingsDeleteAccountTitle'),
    settingsDangerZoneTitle: t('settingsDangerZoneTitle'),
    settingsDescription: t('settingsDescription'),
    settingsNotificationsComingSoon: t('settingsNotificationsComingSoon'),
    settingsNotificationsTitle: t('settingsNotificationsTitle'),
    settingsSignOut: t('settingsSignOut'),
    settingsTitle: t('settingsTitle'),
    status: t('status'),
    submitBusinessCta: t('submitBusinessCta'),
    subscriptionDescription: t('subscriptionDescription'),
    subscriptionPeriodEnd: t('subscriptionPeriodEnd'),
    subscriptionTitle: t('subscriptionTitle'),
    tabFeatures: t('tabFeatures'),
    tabIntroduction: t('tabIntroduction'),
    tabProfile: t('tabProfile'),
    tabSettings: t('tabSettings'),
    upgradeVipCta: t('upgradeVipCta'),
    upgradeVipDescription: t('upgradeVipDescription'),
    upgradeVipError: t('upgradeVipError'),
    upgradeVipPending: t('upgradeVipPending'),
    upgradeVipTitle: t('upgradeVipTitle'),
    verifyCard: t('verifyCard'),
    viewPublicProfile: t('viewPublicProfile'),
    welcomeModalDescription: t('welcomeModalDescription'),
    welcomeModalTitle: t('welcomeModalTitle'),
  };

  const initialTab = isMemberDashboardTab(tab) ? tab : 'profile';
  const memberTierLabel = resolveMemberTierLabel(card?.memberType, isVip, t);
  const vipPeriodEnd = vipSubscription?.currentPeriodEnd ?? vipMembership?.endsAt ?? null;
  const membershipStatusDescription =
    isVip && vipPeriodEnd
      ? t('membershipVipActiveUntil').replace(
          '{date}',
          new Intl.DateTimeFormat(locale, {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }).format(vipPeriodEnd),
        )
      : null;

  const possibilitiesLabels = {
    billingMonthly: t('planBillingMonthly'),
    billingYearly: t('planBillingYearly'),
    cancelVipScheduled: t('cancelVipScheduled'),
    featureBusinessSubmit: t('planFeatureBusinessSubmit'),
    featureDigitalCard: t('planFeatureDigitalCard'),
    featureDirectory: t('planFeatureDirectory'),
    featureDirectoryListing: t('planFeatureDirectoryListing'),
    featureIntroductions: t('planFeatureIntroductions'),
    featureOffers: t('planFeatureOffers'),
    featurePrioritySupport: t('planFeaturePrioritySupport'),
    featureVipNetworking: t('planFeatureVipNetworking'),
    featuresDescription: t('featuresDescription'),
    featuresTitle: t('featuresTitle'),
    planCurrent: t('planCurrent'),
    planGetStarted: t('planGetStarted'),
    planMemberPriceMonthly: t('planMemberPriceMonthly'),
    planMemberPriceNote: t('planMemberPriceNote'),
    planMemberPriceYearly: t('planMemberPriceYearly'),
    planMemberTitle: t('planMemberTitle'),
    planPartnerPriceMonthly: t('planPartnerPriceMonthly'),
    planPartnerPriceNote: t('planPartnerPriceNote'),
    planPartnerPriceYearly: t('planPartnerPriceYearly'),
    planPartnerTitle: t('planPartnerTitle'),
    planPopularBadge: t('planPopularBadge'),
    planSubmitBusiness: t('submitBusinessCta'),
    planSwitchAnnual: t('planSwitchAnnual'),
    planSwitchMonthly: t('planSwitchMonthly'),
    planUpgradeVip: t('upgradeVipCta'),
    planUpgradeVipPending: t('upgradeVipPending'),
    planUpgradeVipError: t('upgradeVipError'),
    planViewBusiness: t('viewPublicProfile'),
    status: t('status'),
    planVipPriceMonthly: t('planVipPriceMonthly'),
    planVipPriceNoteMonthly: t('planVipPriceNoteMonthly'),
    planVipPriceNoteYearly: t('planVipPriceNoteYearly'),
    planVipPriceYearly: t('planVipPriceYearly'),
    planVipRequired: t('planVipRequired'),
    planVipTitle: t('planVipTitle'),
  };

  const introductionFormLabels = {
    clientContact: tIntro('clientContact'),
    clientContactHelp: tIntro('clientContactHelp'),
    clientName: tIntro('clientName'),
    formError: tIntro('formError'),
    message: tIntro('message'),
    messageHelp: tIntro('messageHelp'),
    optional: tIntro('optional'),
    selectBusiness: tIntro('selectBusiness'),
    selectPlaceholder: tIntro('selectPlaceholder'),
    submit: tIntro('submit'),
    submitting: tIntro('submitting'),
    success: tIntro('success'),
  };

  const introductionLabels = {
    emptyBusinessesDescription: tIntro('emptyBusinessesDescription'),
    emptyBusinessesTitle: tIntro('emptyBusinessesTitle'),
    formDescription: tIntro('formDescription'),
    formTitle: tIntro('formTitle'),
    introductionsRestricted: t('introductionsRestricted'),
    notSet: tIntro('notSet'),
    recentCreated: tIntro('created'),
    recentDescription: tIntro('recentDescription'),
    recentEmptyDescription: tIntro('recentEmptyDescription'),
    recentEmptyTitle: tIntro('recentEmptyTitle'),
    recentStatus: tIntro('status'),
    recentTitle: tIntro('recentTitle'),
    upgradeVipCta: t('upgradeVipCta'),
    upgradeVipDescription: t('upgradeVipDescription'),
  };

  return (
    <MemberDashboardTabs
      fallbackInitials={getInitials(user.displayName)}
      memberTierLabel={memberTierLabel}
      notSetLabel={t('notSet')}
      business={
        business
          ? {
              formattedStatus: formatBusinessStatus(business.status, t),
              name: business.name,
              slug: business.slug,
              status: business.status,
            }
          : null
      }
      card={
        card
          ? {
              memberType: card.memberType,
              number: card.number,
              status: card.status,
            }
          : null
      }
      cities={allCities.map((city) => ({
        id: city.id,
        label: `${city.name}, ${city.country.name}`,
      }))}
      countries={allCountries.map((country) => ({
        id: country.id,
        label: country.name,
      }))}
      hasBillingPortal={Boolean(vipSubscription?.stripeCustomerId)}
      initialTab={initialTab}
      introductionBusinesses={introductionBusinesses}
      introductionFormLabels={introductionFormLabels}
      introductionLabels={introductionLabels}
      introductionRecentRequests={introductionRecentRows}
      isVip={isVip}
      labels={labels}
      locale={locale}
      membershipStatusDescription={membershipStatusDescription}
      possibilitiesLabels={possibilitiesLabels}
      profile={{
        avatarUrl: profile?.avatarUrl ?? null,
        bio: profile?.bio ?? null,
        cityId: profile?.cityId ?? null,
        cityName: profile?.city?.name ?? null,
        countryId: profile?.countryId ?? null,
        countryName: profile?.country?.name ?? null,
        displayName: user.displayName,
        email: user.email,
        phone: user.phone,
      }}
      profileLabels={profileLabels}
      showWelcomeModal={showWelcomeModal}
      verifyUrl={verifyUrl}
      vipSubscription={
        vipSubscription
          ? {
              cancelAtPeriodEnd: vipSubscription.cancelAtPeriodEnd,
              currentPeriodEnd: vipSubscription.currentPeriodEnd,
            }
          : null
      }
    />
  );
}
