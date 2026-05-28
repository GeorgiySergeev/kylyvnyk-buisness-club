import { asc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { db } from '@/db/client';
import { cities, countries } from '@/db/schema';
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
    <PageWrapper>
      <section className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="space-y-5">
          <p className="text-xs font-semibold tracking-[0.32em] text-primary uppercase">
            {tAuth('onboardingEyebrow')}
          </p>
          <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
            {tAuth('onboardingTitle')}
          </h1>
          <p className="max-w-xl text-base leading-8 text-muted-foreground">
            {tAuth('onboardingDescription')}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-xl shadow-black/20 sm:p-8">
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
            }}
            labels={{
              bio: tAuth('bioLabel'),
              city: tAuth('cityLabel'),
              country: tAuth('countryLabel'),
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
