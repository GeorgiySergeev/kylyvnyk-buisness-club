import type { SupportedLocale } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { PageBreadcrumbs } from '@/components/navigation/page-breadcrumbs';
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
  numbered?: boolean;
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
    numbered: true,
    sections: [
      { title: 'cookieGeneralTitle', body: 'cookieGeneralBody' },
      { title: 'cookieWhatAreTitle', body: 'cookieWhatAreBody' },
      { title: 'cookieCategoriesTitle', body: 'cookieCategoriesBody' },
      { title: 'cookieEssentialTitle', body: 'cookieEssentialBody' },
      { title: 'cookieAnalyticsTitle', body: 'cookieAnalyticsBody' },
      { title: 'cookieFunctionalTitle', body: 'cookieFunctionalBody' },
      { title: 'cookieMarketingTitle', body: 'cookieMarketingBody' },
      { title: 'cookieThirdPartyTitle', body: 'cookieThirdPartyBody' },
      { title: 'cookieManagementTitle', body: 'cookieManagementBody' },
      { title: 'cookieChangesTitle', body: 'cookieChangesBody' },
      { title: 'cookieContactTitle', body: 'cookieContactBody' },
      { title: 'cookieLanguageTitle', body: 'cookieLanguageBody' },
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
  // optional raw HTML override for the page body (server-rendered)
  contentHtml?: string;
  titleText?: string;
  descriptionText?: string;
}

export function LegalPage({
  document,
  locale,
  contentHtml,
  titleText,
  descriptionText,
}: LegalPageProps) {
  const t = getT('legal', locale);
  const page = LEGAL_PAGES[document];

  const title = titleText ?? t(page.title);
  const description = descriptionText ?? t(page.description);

  return (
    <PageWrapper>
      <article className="mx-auto max-w-4xl">
        <header className="space-y-5 border-b border-border pb-8">
          <PageBreadcrumbs currentLabel={title} locale={locale} />
          <div className="space-y-4">
            <h1 className="font-display text-4xl leading-tight text-foreground md:text-6xl">
              {title}
            </h1>
            <p className="max-w-3xl whitespace-pre-line text-base leading-8 text-muted-foreground">
              {description}
            </p>
          </div>
        </header>

        <div className="py-8">
          {contentHtml ? (
            <div
              className="legal-markdown-content max-w-none text-muted-foreground [&_.legal-md-doc-title]:font-display [&_.legal-md-doc-title]:text-2xl [&_.legal-md-doc-title]:text-foreground [&_.legal-md-meta_p]:text-sm [&_.legal-md-section:last-child_p:nth-last-child(-n+2)]:text-xs [&_.legal-md-section:last-child_p:nth-last-child(-n+2)]:leading-5 [&_.legal-md-section:last-child_p:nth-last-child(-n+2)]:text-muted-foreground/80 [&_.legal-md-section]:py-5 [&_.legal-md-section:first-child]:pt-0 [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:leading-7 [&_p]:leading-7 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          ) : (
            page.sections.map((section, i) => (
              <section className="py-5 first:pt-0" key={section.title}>
                <h2 className="font-semibold text-foreground">
                  {page.numbered ? `${i + 1}. ` : ''}{t(section.title)}
                </h2>
                <p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{t(section.body)}</p>
              </section>
            ))
          )}
        </div>

        <footer className="border-t border-border pt-6">
          <p className="text-xs leading-6 text-muted-foreground">{t('lastUpdated')}</p>
        </footer>
      </article>
    </PageWrapper>
  );
}
