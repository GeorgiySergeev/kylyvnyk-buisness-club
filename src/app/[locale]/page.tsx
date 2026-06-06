import { FindPartnerSection } from '@/components/home/find-partner-section';
import { HeroSection } from '@/components/home/hero-section';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { MobileBottomNav } from '@/components/home/mobile-bottom-nav';
import { RecommendedSection } from '@/components/home/recommended-section';
import { StatsSection } from '@/components/home/stats-section';
import { type PartnerData, TopPartnersSection } from '@/components/home/top-partners-section';
import { type SupportedLocale, localizeHref, resolveLocale } from '@/components/layout/navigation';
import { getPublishedBusinesses } from '@/features/directory/lib/get-published-businesses';
import { getNavigationSession } from '@/lib/auth/navigation-session';
import { getT } from '@/lib/i18n/t-server';

const STEP_RAW = [
  { titleKey: 'stepOneTitle', textKey: 'stepOneText' },
  { titleKey: 'stepTwoTitle', textKey: 'stepTwoText' },
  { titleKey: 'stepThreeTitle', textKey: 'stepThreeText' },
] as const;

const FILTER_KEYS = ['filterCountry', 'filterCity', 'filterCategory'] as const;

const BOTTOM_NAV_KEYS = ['bottomHome', 'bottomDirectory', 'bottomCard'] as const;

interface LocaleHomePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const session = await getNavigationSession();
  const t = getT('home', locale);

  const isAuthenticated = session.role !== 'guest';

  const steps = STEP_RAW.map((s) => ({
    title: t(s.titleKey),
    text: t(s.textKey),
  }));

  const [topBusinesses, recommendedBusinesses] = await Promise.all([
    getPublishedBusinesses({ isTopPartner: true, limit: 3 }),
    getPublishedBusinesses({ isRecommended: true, limit: 3 }),
  ]);

  const partners: PartnerData[] = topBusinesses.map((business) => ({
    name: business.name,
    category: business.category?.name || t('topPartnerOneCategory'),
    condition: t('partnerConditionLabel'),
    description: business.description || t('topPartnerOneDescription'),
    location:
      [business.city?.name, business.country?.name].filter(Boolean).join(', ') ||
      t('topPartnerOneLocation'),
    discount: business.discountLabel || '',
    flag: business.country?.flagEmoji || '',
    flagLabel: business.country?.iso2 || 'US',
    href: localizeHref(locale, `/directory/${business.slug}`),
    img: business.logoUrl || '/partners/default.svg',
  }));

  const recommendedPartners = recommendedBusinesses.map((business) => ({
    name: business.name,
    category: business.category?.name || t('topPartnerOneCategory'),
    location:
      [business.city?.name, business.country?.name].filter(Boolean).join(', ') ||
      t('topPartnerOneLocation'),
    description: business.description || undefined,
    img: business.logoUrl || undefined,
    flagLabel: business.country?.iso2 || undefined,
  }));

  const filters = FILTER_KEYS.map((key) => ({ label: t(key) }));

  const bottomNavLabels: Record<string, string> = {};
  for (const key of BOTTOM_NAV_KEYS) {
    bottomNavLabels[key] = t(key);
  }

  return (
    <div className="main-content">
      <div className="mx-auto max-w-(--kc-max-w) space-y-6 border-0 px-4 xs:space-y-8 md:border md:border-border md:px-12 lg:space-y-12 container">
        <HeroSection
          locale={locale}
          isAuthenticated={isAuthenticated}
          heroTitle={t('heroTitle')}
          heroEyebrow={t('heroEyebrow')}
          heroSubtitle={t('heroSubtitle')}
          heroSubtitleHighlight={t('heroSubtitleHighlight')}
          memberDashboard={t('memberDashboard')}
          secondaryCta={t('secondaryCta')}
          tierMemberTitle={t('tierMemberTitle')}
          tierMemberDesc={t('tierMemberDesc')}
          tierVipTitle={t('tierVipTitle')}
          tierVipDesc={t('tierVipDesc')}
          tierPartnerTitle={t('tierPartnerTitle')}
          tierPartnerDesc={t('tierPartnerDesc')}
          tierPopularBadge={t('tierPopularBadge')}
          tierApplyCta={t('tierApplyCta')}
        />

        <StatsSection
          eyebrow={t('statsEyebrow')}
          title={t('statsTitle')}
          subtitle={t('statsSubtitle')}
          stats={[
            { value: t('statMembersValue'), label: t('statMembersLabel') },
            { value: t('statCountriesValue'), label: t('statCountriesLabel') },
            { value: t('statPartnersValue'), label: t('statPartnersLabel') },
          ]}
        />

        <TopPartnersSection
          locale={locale}
          eyebrow={t('topPartnersEyebrow')}
          title={t('topPartnersTitle')}
          subtitle={t('topPartnersSubtitle')}
          viewAll={t('viewAll')}
          detailsCta={t('detailsCta')}
          conditionLabel={t('partnerConditionLabel')}
          verifiedLabel={t('partnerVerifiedLabel')}
          previousLabel={t('topPartnersPrevious')}
          nextLabel={t('topPartnersNext')}
          regionLabel={t('topPartnersSliderLabel')}
          partners={partners}
        />

        <HowItWorksSection
          eyebrow={t('howEyebrow')}
          title={t('howTitle')}
          subtitle={t('howSubtitle')}
          steps={steps}
        />

        <FindPartnerSection
          locale={locale}
          eyebrow={t('searchEyebrow')}
          title={t('searchTitle')}
          subtitle={t('searchSubtitle')}
          searchCta={t('searchCta')}
          filters={filters}
        />

        <RecommendedSection
          locale={locale}
          eyebrow={t('recommendedEyebrow')}
          title={t('recommendedTitle')}
          subtitle={t('recommendedSubtitle')}
          viewAll={t('showMoreCta')}
          detailsCta={t('detailsCta')}
          condition={t('recommendedCondition')}
          verifiedLabel={t('partnerVerifiedLabel')}
          partners={recommendedPartners}
        />
      </div>

      <MobileBottomNav locale={locale} labels={bottomNavLabels} />
    </div>
  );
}
