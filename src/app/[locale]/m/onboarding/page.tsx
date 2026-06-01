import { asc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { db } from '@/db/client';
import { cities, countries } from '@/db/schema';
import { AuthPageHeader } from '@/features/auth/components/auth-page-header';
import { OnboardingForm } from '@/features/auth/components/onboarding-form';
import { isOnboardingComplete } from '@/features/auth/lib/check-onboarding';
import { requireUser } from '@/features/auth/lib/current-user';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface OnboardingPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const complete = await isOnboardingComplete(user.id);

  if (complete) {
    redirect(localizeHref(locale, '/m/dashboard'));
  }

  type CountryRow = { id: number; name: string };
  type CityRow = { country: { name: string }; id: number; name: string };

  const [countryRows, cityRows]: [CountryRow[], CityRow[]] = await Promise.all([
    db.query.countries.findMany({
      orderBy: [asc(countries.name)],
    }),
    db.query.cities.findMany({
      orderBy: [asc(cities.name)],
      with: {
        country: true,
      },
    }),
  ]);
  const tAuth = getT('auth', locale);

  return (
    <PageWrapper noTopPad className="max-w-5xl">
      <AuthPageHeader
        eyebrow={tAuth('onboardingEyebrow')}
        title={tAuth('onboardingTitle')}
        description={tAuth('onboardingDescription')}
        titleId="onboarding-title"
      />

      <section className="relative overflow-hidden border-y border-border/50">
        <div className="kc-how-it-works-bg pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative flex justify-center px-6 py-10 sm:px-8 sm:py-12 md:py-16">
          <OnboardingForm
            cities={cityRows.map((city) => ({
              id: city.id,
              label: `${city.name}, ${city.country.name}`,
            }))}
            countries={countryRows.map((country) => ({
              id: country.id,
              label: country.name,
            }))}
            defaultValues={{
              bio: '',
              cityId: undefined,
              countryId: undefined,
              displayName: user.displayName ?? '',
            }}
            labels={{
              bio: tAuth('bioLabel'),
              city: tAuth('cityLabel'),
              country: tAuth('countryLabel'),
              displayName: tAuth('displayNameLabel'),
              fillLater: tAuth('onboardingFillLater'),
              formError: tAuth('formError'),
              optional: tAuth('onboardingOptional'),
              submit: tAuth('onboardingSubmit'),
              submitting: tAuth('onboardingSubmitting'),
            }}
            locale={locale}
          />
        </div>
      </section>
    </PageWrapper>
  );
}
