import { asc } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { db } from '@/db/client';
import { categories, cities, countries } from '@/db/schema';
import { AuthPageHeader } from '@/features/auth/components/auth-page-header';
import { guardOnboarded } from '@/features/auth/lib/role-guards';
import { SubmitBusinessForm } from '@/features/business/components/submit-business-form';
import { userHasActiveVipMembership } from '@/features/billing/lib/membership-lifecycle';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface BusinessNewPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function BusinessNewPage({ params }: BusinessNewPageProps) {
  const { locale } = await params;
  const user = await guardOnboarded(locale);
  const t = getT('dashboard', locale);

  if (!(await userHasActiveVipMembership(user.id))) {
    redirect(localizeHref(locale, '/m/dashboard'));
  }

  const [countryRows, cityRows, categoryRows] = await Promise.all([
    db.query.countries.findMany({ orderBy: [asc(countries.name)] }),
    db.query.cities.findMany({
      orderBy: [asc(cities.name)],
      with: { country: true },
    }),
    db.query.categories.findMany({ orderBy: [asc(categories.name)] }),
  ]);

  return (
    <PageWrapper noTopPad className="max-w-5xl">
      <AuthPageHeader
        eyebrow={t('businessFormEyebrow')}
        title={t('businessFormTitle')}
        description={t('businessFormDescription')}
        titleId="business-form-title"
      />

      <section className="relative overflow-hidden border-y border-border/50">
        <div className="kc-how-it-works-bg pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative flex justify-center px-6 py-10 sm:px-8 sm:py-12 md:py-16">
          <SubmitBusinessForm
            categories={categoryRows.map((category) => ({
              id: category.id,
              label: category.name,
            }))}
            cities={cityRows.map((city) => ({
              id: city.id,
              label: `${city.name}, ${city.country.name}`,
            }))}
            countries={countryRows.map((country) => ({
              id: country.id,
              label: country.name,
            }))}
            defaultValues={{
              categoryId: undefined,
              cityId: undefined,
              countryId: undefined,
              description: '',
              email: user.email ?? '',
              name: '',
              phone: user.phone,
              representativeName: user.displayName ?? '',
              website: '',
            }}
            labels={{
              category: t('businessFormCategory'),
              city: t('businessFormCity'),
              country: t('businessFormCountry'),
              description: t('businessFormDescriptionField'),
              email: t('businessFormEmail'),
              formError: t('businessFormError'),
              name: t('businessFormName'),
              optional: t('optional'),
              phone: t('businessFormPhone'),
              representativeName: t('businessFormRepresentative'),
              submit: t('businessFormSubmit'),
              submitting: t('businessFormSubmitting'),
              website: t('businessFormWebsite'),
            }}
            locale={locale}
          />
        </div>
      </section>
    </PageWrapper>
  );
}
