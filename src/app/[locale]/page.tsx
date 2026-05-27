import { FindPartnerSection } from '@/components/home/find-partner-section';
import { HeroSection } from '@/components/home/hero-section';
import { HowItWorksSection } from '@/components/home/how-it-works-section';
import { MobileBottomNav } from '@/components/home/mobile-bottom-nav';
import { RecommendedSection } from '@/components/home/recommended-section';
import { StatsSection } from '@/components/home/stats-section';
import { type PartnerData, TopPartnersSection } from '@/components/home/top-partners-section';
import type { SupportedLocale } from '@/components/layout/navigation';
import { getNavigationSession } from '@/lib/auth/navigation-session';
import { getT } from '@/lib/i18n/t-server';

const PARTNER_RAW = [
  {
    nameKey: 'topPartnerOneName',
    categoryKey: 'topPartnerOneCategory',
    locationKey: 'topPartnerOneLocation',
    discountKey: 'topPartnerOneDiscount',
    flagKey: 'topPartnerOneFlag',
    conditionKey: 'topPartnerOneCondition',
    descriptionKey: 'topPartnerOneDescription',
    img: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
  {
    nameKey: 'topPartnerTwoName',
    categoryKey: 'topPartnerTwoCategory',
    locationKey: 'topPartnerTwoLocation',
    discountKey: 'topPartnerTwoDiscount',
    flagKey: 'topPartnerTwoFlag',
    conditionKey: 'topPartnerTwoCondition',
    descriptionKey: 'topPartnerTwoDescription',
    img: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
  {
    nameKey: 'topPartnerThreeName',
    categoryKey: 'topPartnerThreeCategory',
    locationKey: 'topPartnerThreeLocation',
    discountKey: 'topPartnerThreeDiscount',
    flagKey: 'topPartnerThreeFlag',
    conditionKey: 'topPartnerThreeCondition',
    descriptionKey: 'topPartnerThreeDescription',
    img: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600',
  },
] as const;

const STEP_RAW = [
  { titleKey: 'stepOneTitle', textKey: 'stepOneText' },
  { titleKey: 'stepTwoTitle', textKey: 'stepTwoText' },
  { titleKey: 'stepThreeTitle', textKey: 'stepThreeText' },
  { titleKey: 'stepFourTitle', textKey: 'stepFourText' },
] as const;

const RECOMMENDED_RAW = [
  { nameKey: 'recommendedPartnerOneName', metaKey: 'recommendedPartnerOneMeta' },
  { nameKey: 'recommendedPartnerTwoName', metaKey: 'recommendedPartnerTwoMeta' },
  { nameKey: 'recommendedPartnerThreeName', metaKey: 'recommendedPartnerThreeMeta' },
] as const;

const FILTER_KEYS = ['filterCountry', 'filterCity', 'filterCategory'] as const;

const BOTTOM_NAV_KEYS = ['bottomHome', 'bottomDirectory', 'bottomCard'] as const;

interface LocaleHomePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;
  const session = await getNavigationSession();
  const t = getT('home', locale);

  const isAuthenticated = session.role !== 'guest';

  const partners: PartnerData[] = PARTNER_RAW.map((p) => ({
    name: t(p.nameKey),
    category: t(p.categoryKey),
    condition: t(p.conditionKey),
    description: t(p.descriptionKey),
    location: t(p.locationKey),
    discount: t(p.discountKey),
    flag: t(p.flagKey),
    flagLabel:
      p.flagKey === 'topPartnerOneFlag' ? 'CH' : p.flagKey === 'topPartnerTwoFlag' ? 'CA' : 'US',
    img: p.img,
  }));

  const steps = STEP_RAW.map((s) => ({
    title: t(s.titleKey),
    text: t(s.textKey),
  }));

  const recommendedPartners = RECOMMENDED_RAW.map((r) => ({
    name: t(r.nameKey),
    meta: t(r.metaKey),
  }));

  const filters = FILTER_KEYS.map((key) => ({ label: t(key) }));

  const bottomNavLabels: Record<string, string> = {};
  for (const key of BOTTOM_NAV_KEYS) {
    bottomNavLabels[key] = t(key);
  }

  return (
    <>
      <div className="mx-auto max-w-(--kc-max-w) space-y-6 border-0 bg-card-foreground px-4 pb-24 pt-4 xs:space-y-8 xs:pb-28 xs:pt-6 sm:pb-28 sm:pt-6 md:border md:border-border md:px-12 md:pb-16 md:pt-8 lg:space-y-12 container">
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
          tierApplyCta={t('tierApplyCta')}
        />

        <StatsSection
          stats={[
            { value: t('statMembersValue'), label: t('statMembersLabel') },
            { value: t('statCountriesValue'), label: t('statCountriesLabel') },
            { value: t('statPartnersValue'), label: t('statPartnersLabel') },
          ]}
        />

        <TopPartnersSection
          locale={locale}
          title={t('topPartnersTitle')}
          subtitle={t('topPartnersSubtitle')}
          viewAll={t('viewAll')}
          detailsCta={t('detailsCta')}
          conditionLabel={t('partnerConditionLabel')}
          recommendedLabel={t('partnerRecommendedLabel')}
          topPartnerLabel={t('partnerTopLabel')}
          verifiedLabel={t('partnerVerifiedLabel')}
          partners={partners}
        />

        <HowItWorksSection title={t('howTitle')} steps={steps} />

        <FindPartnerSection
          locale={locale}
          title={t('searchTitle')}
          searchCta={t('searchCta')}
          filters={filters}
        />

        <RecommendedSection
          locale={locale}
          title={t('recommendedTitle')}
          showMoreCta={t('showMoreCta')}
          condition={t('recommendedCondition')}
          partners={recommendedPartners}
        />
      </div>

      <MobileBottomNav locale={locale} labels={bottomNavLabels} />
    </>
  );
}
