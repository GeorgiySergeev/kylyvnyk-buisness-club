import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { getT, type Key } from '@/lib/i18n/t-server';

type LegalMessageKey = Key<'legal'>;

type LegalDocument =
  | 'clubRules'
  | 'contact'
  | 'cookie'
  | 'disclaimer'
  | 'introductionRules'
  | 'partnerRules'
  | 'privacy'
  | 'refund'
  | 'terms';

interface LegalSection {
  body: LegalMessageKey;
  title: LegalMessageKey;
}

interface LegalPageConfig {
  description: LegalMessageKey;
  sections: LegalSection[];
  title: LegalMessageKey;
}

const LEGAL_PAGES: Record<LegalDocument, LegalPageConfig> = {
  terms: {
    title: 'termsTitle',
    description: 'termsDescription',
    sections: [
      { title: 'termsMembershipTitle', body: 'termsMembershipBody' },
      { title: 'termsPlatformTitle', body: 'termsPlatformBody' },
      { title: 'termsPartnerTitle', body: 'termsPartnerBody' },
      { title: 'termsDisputesTitle', body: 'termsDisputesBody' },
      { title: 'termsLiabilityTitle', body: 'termsLiabilityBody' },
    ],
  },
  privacy: {
    title: 'privacyTitle',
    description: 'privacyDescription',
    sections: [
      { title: 'privacyDataTitle', body: 'privacyDataBody' },
      { title: 'privacyUseTitle', body: 'privacyUseBody' },
      { title: 'privacySharingTitle', body: 'privacySharingBody' },
      { title: 'privacySecurityTitle', body: 'privacySecurityBody' },
      { title: 'privacyRightsTitle', body: 'privacyRightsBody' },
    ],
  },
  cookie: {
    title: 'cookieTitle',
    description: 'cookieDescription',
    sections: [
      { title: 'cookieUseTitle', body: 'cookieUseBody' },
      { title: 'cookieTypesTitle', body: 'cookieTypesBody' },
      { title: 'cookieControlTitle', body: 'cookieControlBody' },
    ],
  },
  refund: {
    title: 'refundTitle',
    description: 'refundDescription',
    sections: [
      { title: 'refundSubscriptionTitle', body: 'refundSubscriptionBody' },
      { title: 'refundAccessTitle', body: 'refundAccessBody' },
      { title: 'refundRequiredTitle', body: 'refundRequiredBody' },
    ],
  },
  clubRules: {
    title: 'clubRulesTitle',
    description: 'clubRulesDescription',
    sections: [
      { title: 'clubRulesAccessTitle', body: 'clubRulesAccessBody' },
      { title: 'clubRulesConductTitle', body: 'clubRulesConductBody' },
      { title: 'clubRulesCardTitle', body: 'clubRulesCardBody' },
      { title: 'clubRulesModerationTitle', body: 'clubRulesModerationBody' },
    ],
  },
  partnerRules: {
    title: 'partnerRulesTitle',
    description: 'partnerRulesDescription',
    sections: [
      { title: 'partnerRulesEligibilityTitle', body: 'partnerRulesEligibilityBody' },
      { title: 'partnerRulesProfileTitle', body: 'partnerRulesProfileBody' },
      { title: 'partnerRulesOffersTitle', body: 'partnerRulesOffersBody' },
      { title: 'partnerRulesComplianceTitle', body: 'partnerRulesComplianceBody' },
    ],
  },
  introductionRules: {
    title: 'introductionRulesTitle',
    description: 'introductionRulesDescription',
    sections: [
      { title: 'introductionRulesAccessTitle', body: 'introductionRulesAccessBody' },
      { title: 'introductionRulesRequestTitle', body: 'introductionRulesRequestBody' },
      { title: 'introductionRulesReviewTitle', body: 'introductionRulesReviewBody' },
      { title: 'introductionRulesBoundariesTitle', body: 'introductionRulesBoundariesBody' },
    ],
  },
  disclaimer: {
    title: 'disclaimerTitle',
    description: 'disclaimerDescription',
    sections: [
      { title: 'disclaimerPlatformTitle', body: 'disclaimerPlatformBody' },
      { title: 'disclaimerPartnersTitle', body: 'disclaimerPartnersBody' },
      { title: 'disclaimerNoPromiseTitle', body: 'disclaimerNoPromiseBody' },
    ],
  },
  contact: {
    title: 'contactTitle',
    description: 'contactDescription',
    sections: [
      { title: 'contactSupportTitle', body: 'contactSupportBody' },
      { title: 'contactPrivacyTitle', body: 'contactPrivacyBody' },
      { title: 'contactLegalTitle', body: 'contactLegalBody' },
    ],
  },
};

interface LegalPageProps {
  document: LegalDocument;
  locale: SupportedLocale;
}

export function LegalPage({ document, locale }: LegalPageProps) {
  const t = getT('legal', locale);
  const page = LEGAL_PAGES[document];

  return (
    <PageWrapper>
      <article className="mx-auto max-w-4xl">
        <header className="space-y-5 border-b border-border pb-8">
          <p className="text-xs font-semibold tracking-[0.32em] text-primary uppercase">
            {t('eyebrow')}
          </p>
          <div className="space-y-4">
            <h1 className="font-display text-4xl leading-tight text-foreground md:text-6xl">
              {t(page.title)}
            </h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              {t(page.description)}
            </p>
          </div>
        </header>

        <div className="grid gap-4 py-8">
          {page.sections.map((section) => (
            <section
              className="rounded-lg border border-border bg-card p-5 shadow-sm md:p-6"
              key={section.title}
            >
              <h2 className="text-xl font-semibold text-foreground">{t(section.title)}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(section.body)}</p>
            </section>
          ))}
        </div>

        <footer className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-6 text-muted-foreground">{t('lastUpdated')}</p>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={localizeHref(locale, '/')}
          >
            {t('backHome')}
          </Link>
        </footer>
      </article>
    </PageWrapper>
  );
}
