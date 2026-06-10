import { asc } from 'drizzle-orm';
import { cache } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { db } from '@/db/client';
import { categories, countries } from '@/db/schema';
import { AuthPageHeader } from '@/features/auth/components/auth-page-header';
import { PartnerRegistrationForm } from '@/features/partner-registration/components/partner-registration-form';
import { getT } from '@/lib/i18n/t-server';

export const revalidate = 3600;

const getCachedT = cache((locale: SupportedLocale) => getT('partnerRegistration', locale));

interface PartnerRegisterPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function PartnerRegisterPage({ params }: PartnerRegisterPageProps) {
  const { locale } = await params;
  const t = getCachedT(locale);

  const [categoryRows, countryRows] = await Promise.all([
    db.query.categories.findMany({ orderBy: [asc(categories.name)] }),
    db.query.countries.findMany({ orderBy: [asc(countries.name)] }),
  ]);

  return (
    <PageWrapper noTopPad className="max-w-5xl">
      <AuthPageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        titleId="partner-register-title"
      />

      <section className="relative overflow-hidden border-y border-ds-border/70">
        <div className="kc-how-it-works-bg pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative flex justify-center px-4 py-10 sm:px-8 sm:py-12 md:py-16">
          <PartnerRegistrationForm
            categories={categoryRows.map((category) => ({
              id: category.id,
              label: category.name,
            }))}
            countries={countryRows.map((country) => ({
              id: country.id,
              label: country.name,
            }))}
            labels={{
              acceptLegal: t('acceptLegal'),
              acceptLegalPrefix: t('acceptLegalPrefix'),
              acceptLegalRequired: t('errorAcceptLegal'),
              back: t('back'),
              businessName: t('businessName'),
              businessNamePlaceholder: t('businessNamePlaceholder'),
              businessNameRequired: t('errorBusinessName'),
              category: t('category'),
              categoryPlaceholder: t('categoryPlaceholder'),
              categoryRequired: t('errorCategory'),
              city: t('city'),
              cityPlaceholder: t('cityPlaceholder'),
              cityRequired: t('errorCity'),
              confirmAuthority: t('confirmAuthority'),
              confirmAuthorityRequired: t('errorConfirmAuthority'),
              country: t('country'),
              countryPlaceholder: t('countryPlaceholder'),
              countryRequired: t('errorCountry'),
              email: t('email'),
              emailInvalid: t('errorEmail'),
              emailPlaceholder: t('emailPlaceholder'),
              formError: t('formError'),
              next: t('next'),
              countrySearchPlaceholder: t('phoneCountrySearchPlaceholder'),
              countrySelectLabel: t('phoneCountrySelectLabel'),
              phone: t('phone'),
              phonePlaceholder: t('phonePlaceholder'),
              phoneRequired: t('errorPhone'),
              privacyLink: t('privacyLink'),
              previewEmpty: t('previewEmpty'),
              previewTitle: t('previewTitle'),
              progress: t('progress'),
              partnerRulesLink: t('partnerRulesLink'),
              representativeName: t('representativeName'),
              representativeNamePlaceholder: t('representativeNamePlaceholder'),
              representativeNameRequired: t('errorRepresentativeName'),
              stepBusinessDescription: t('stepBusinessDescription'),
              stepBusinessTitle: t('stepBusinessTitle'),
              stepLocationDescription: t('stepLocationDescription'),
              stepLocationTitle: t('stepLocationTitle'),
              stepRepresentativeDescription: t('stepRepresentativeDescription'),
              stepRepresentativeTitle: t('stepRepresentativeTitle'),
              stepReviewDescription: t('stepReviewDescription'),
              stepReviewTitle: t('stepReviewTitle'),
              submit: t('submit'),
              submitting: t('submitting'),
              successDescription: t('successDescription'),
              successStatus: t('successStatus'),
              successTitle: t('successTitle'),
              termsLink: t('termsLink'),
              websiteOrSocial: t('websiteOrSocial'),
              websiteOrSocialPlaceholder: t('websiteOrSocialPlaceholder'),
              websiteRequired: t('errorWebsite'),
            }}
            locale={locale}
          />
        </div>
      </section>
    </PageWrapper>
  );
}
