import { asc, count, eq } from 'drizzle-orm';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ClubCard, ClubCardPlaceholder } from '@/components/member/club-card';
import {
  DashboardIntroductionsBlock,
  DashboardPageHeader,
  DashboardPanel,
} from '@/components/member/dashboard-ui';
import { db } from '@/db/client';
import { cities, clubCards, countries, introductions, profiles } from '@/db/schema';
import { guardOnboarded } from '@/features/auth/lib/role-guards';
import { DashboardProfileCard } from '@/features/profile/components/dashboard-profile-card';
import { env } from '@/lib/env';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface DashboardPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const user = await guardOnboarded(locale);
  const t = getT('dashboard', locale);

  const [card, profile, allCountries, allCities, introductionCountRow] = await Promise.all([
    db.query.clubCards.findFirst({
      where: eq(clubCards.userId, user.id),
    }),
    db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
      with: {
        city: {
          columns: {
            name: true,
          },
        },
        country: {
          columns: {
            name: true,
          },
        },
      },
    }),
    db.query.countries.findMany({
      orderBy: [asc(countries.name)],
    }),
    db.query.cities.findMany({
      orderBy: [asc(cities.name)],
      with: {
        country: true,
      },
    }),
    db
      .select({ value: count() })
      .from(introductions)
      .where(eq(introductions.requesterId, user.id)),
  ]);

  const isBusinessMember = user.role !== 'GUEST';
  const introductionCount = introductionCountRow[0]?.value ?? 0;
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

  return (
    <PageWrapper noTopPad className="max-w-5xl">
      <DashboardPageHeader description={t('description')} eyebrow={t('eyebrow')} title={t('title')} />

      <section className="relative overflow-hidden border-y border-border/50">
        <div className="kc-how-it-works-bg pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="relative grid lg:grid-cols-2">
          <DashboardProfileCard
            locale={locale}
            displayName={user.displayName}
            email={user.email}
            phone={user.phone}
            avatarUrl={profile?.avatarUrl ?? null}
            bio={profile?.bio ?? null}
            countryId={profile?.countryId ?? null}
            countryName={profile?.country?.name ?? null}
            cityId={profile?.cityId ?? null}
            cityName={profile?.city?.name ?? null}
            countries={allCountries.map((country) => ({
              id: country.id,
              label: country.name,
            }))}
            cities={allCities.map((city) => ({
              id: city.id,
              label: `${city.name}, ${city.country.name}`,
            }))}
            labels={profileLabels}
          />

          <DashboardPanel
            className="border-t border-border/50 lg:border-t-0 lg:border-l lg:border-border/50"
            description={t('cardDescription')}
            title={t('cardTitle')}
          >
            {card ? (
              <ClubCard
                cardNumber={card.number}
                memberName={user.displayName ?? 'Member'}
                status={card.status}
                verifyUrl={verifyUrl}
              />
            ) : (
              <ClubCardPlaceholder
                description={t('cardMissingDescription')}
                title={t('cardMissingTitle')}
              />
            )}
          </DashboardPanel>
        </div>
      </section>

      <DashboardIntroductionsBlock
        count={introductionCount}
        countLabel={introductionCount > 0 ? t('activeStatus') : t('noIntroductions')}
        description={isBusinessMember ? t('introductionsDescription') : t('introductionsRestricted')}
        title={t('introductionsTitle')}
        {...(isBusinessMember
          ? {
              actionHref: localizeHref(locale, '/m/introduce'),
              actionLabel: t('businessIntroduction'),
            }
          : {})}
      />
    </PageWrapper>
  );
}
