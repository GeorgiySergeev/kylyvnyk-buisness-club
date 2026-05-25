import { eq } from 'drizzle-orm';
import Link from 'next/link';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { ClubCard } from '@/components/member/club-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/db/client';
import { businesses, clubCards, introductions, profiles } from '@/db/schema';
import { guardOnboarded } from '@/features/auth/lib/role-guards';
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
  const t = getT('dashboard');

  const [card, profile, userBusinesses, userIntroductions] = await Promise.all([
    db.query.clubCards.findFirst({
      where: eq(clubCards.userId, user.id),
    }),
    db.query.profiles.findFirst({
      where: eq(profiles.userId, user.id),
    }),
    db.query.businesses.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        status: true,
        isRecommended: true,
        isTopPartner: true,
      },
      orderBy: (businesses, { desc }) => [desc(businesses.createdAt)],
      where: eq(businesses.userId, user.id),
      with: {
        category: {
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
    db.query.introductions.findMany({
      columns: {
        status: true,
      },
      where: eq(introductions.requesterId, user.id),
    }),
  ]);

  const isProfileComplete = Boolean(user.displayName && profile?.countryId && profile?.cityId);
  const isBusinessMember = user.role === 'BUSINESS' || user.role === 'ADMIN' || user.role === 'VIP';
  const publishedBusinessCount = userBusinesses.filter(
    (business) => business.status === 'PUBLISHED',
  ).length;
  const introductionTotal = userIntroductions.length;
  const introductionUnderReview = userIntroductions.filter(
    (item) => item.status === 'SUBMITTED' || item.status === 'UNDER_REVIEW',
  ).length;
  const introductionApproved = userIntroductions.filter(
    (item) => item.status === 'APPROVED',
  ).length;
  const introductionRejected = userIntroductions.filter(
    (item) => item.status === 'REJECTED',
  ).length;
  const verifyUrl = card
    ? `${env.NEXT_PUBLIC_APP_URL}/${locale}/verify-card/${card.number}`
    : localizeHref(locale, '/verify-card');

  const stats = [
    {
      label: t('role'),
      value: user.role,
    },
    {
      label: t('cardStatus'),
      value: card?.status ?? t('pendingStatus'),
    },
    {
      label: t('businessCount'),
      value: `${publishedBusinessCount}/${userBusinesses.length}`,
    },
    {
      label: t('profileStatus'),
      value: isProfileComplete ? t('profileComplete') : t('profilePartial'),
    },
  ];

  return (
    <PageWrapper>
      <div className="space-y-8">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="space-y-4">
            <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">
              {t('eyebrow')}
            </p>
            <div className="max-w-3xl space-y-3">
              <h1 className="font-display text-4xl leading-tight text-foreground md:text-5xl">
                {t('title')}
              </h1>
              <p className="text-base leading-7 text-muted-foreground">{t('description')}</p>
            </div>
          </div>

          <div className="stats stats-vertical border border-border bg-card shadow-sm sm:stats-horizontal lg:stats-vertical">
            {stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <div className="stat-title text-muted-foreground">{stat.label}</div>
                <div className="stat-value text-xl text-primary">{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(21rem,24rem)_minmax(0,1fr)]">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">{t('cardTitle')}</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">{t('cardDescription')}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {card ? (
                <ClubCard
                  cardNumber={card.number}
                  memberName={user.displayName ?? 'Member'}
                  status={card.status}
                  verifyUrl={verifyUrl}
                />
              ) : (
                <div className="rounded-box border border-border bg-background/40 p-5">
                  <h2 className="text-base font-semibold text-foreground">
                    {t('cardMissingTitle')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t('cardMissingDescription')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{t('profileTitle')}</CardTitle>
                <p className="text-sm leading-6 text-muted-foreground">{t('profileDescription')}</p>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
                    <dt className="text-muted-foreground">{t('displayName')}</dt>
                    <dd className="text-right font-medium text-foreground">
                      {user.displayName ?? t('notSet')}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
                    <dt className="text-muted-foreground">{t('phone')}</dt>
                    <dd className="text-right font-mono text-xs text-foreground">{user.phone}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-3">
                    <dt className="text-muted-foreground">{t('country')}</dt>
                    <dd className="text-right text-foreground">
                      {profile?.countryId ? `#${profile.countryId}` : t('notSet')}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-muted-foreground">{t('city')}</dt>
                    <dd className="text-right text-foreground">
                      {profile?.cityId ? `#${profile.cityId}` : t('notSet')}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{t('quickActionsTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <Button asChild className="justify-start rounded-field">
                  <Link href={localizeHref(locale, '/directory')}>{t('openDirectory')}</Link>
                </Button>
                <Button asChild variant="outline" className="justify-start rounded-field">
                  <Link
                    href={card ? localizeHref(locale, `/verify-card/${card.number}`) : verifyUrl}
                  >
                    {t('verifyCard')}
                  </Link>
                </Button>
                {isBusinessMember ? (
                  <Button asChild variant="outline" className="justify-start rounded-field">
                    <Link href={localizeHref(locale, '/m/introduce')}>
                      {t('businessIntroduction')}
                    </Link>
                  </Button>
                ) : null}
                {user.role === 'ADMIN' ? (
                  <Button asChild variant="outline" className="justify-start rounded-field">
                    <Link href={localizeHref(locale, '/admin')}>{t('adminWorkspace')}</Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">{t('businessTitle')}</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">{t('businessDescription')}</p>
            </CardHeader>
            <CardContent>
              {userBusinesses.length > 0 ? (
                <div className="overflow-hidden rounded-box border border-border">
                  <table className="table table-sm">
                    <tbody>
                      {userBusinesses.map((business) => (
                        <tr key={business.id}>
                          <td>
                            <div className="font-medium text-foreground">{business.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {[business.category?.name, business.country?.name]
                                .filter(Boolean)
                                .join(' · ') || t('notSet')}
                            </div>
                          </td>
                          <td>
                            <Badge
                              variant={business.status === 'PUBLISHED' ? 'default' : 'outline'}
                            >
                              {business.status}
                            </Badge>
                          </td>
                          <td className="text-right">
                            {business.status === 'PUBLISHED' ? (
                              <Link
                                href={localizeHref(locale, `/directory/${business.slug}`)}
                                className="link link-primary text-sm"
                              >
                                {t('viewPublicProfile')}
                              </Link>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-box border border-border bg-background/40 p-5">
                  <h2 className="text-base font-semibold text-foreground">
                    {t('noBusinessTitle')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t('noBusinessDescription')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">{t('introductionsTitle')}</CardTitle>
              <p className="text-sm leading-6 text-muted-foreground">
                {isBusinessMember ? t('introductionsDescription') : t('introductionsRestricted')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-box border border-border bg-background/40 p-5">
                <div className="text-3xl font-semibold text-primary">{introductionTotal}</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {introductionTotal > 0 ? t('activeStatus') : t('noIntroductions')}
                </p>
                <div className="mt-4 grid gap-2 text-sm">
                  <div className="flex items-center justify-between rounded-field border border-border/80 px-3 py-2">
                    <span className="text-muted-foreground">{t('introductionsUnderReview')}</span>
                    <span className="font-semibold text-foreground">{introductionUnderReview}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-field border border-border/80 px-3 py-2">
                    <span className="text-muted-foreground">{t('introductionsApproved')}</span>
                    <span className="font-semibold text-foreground">{introductionApproved}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-field border border-border/80 px-3 py-2">
                    <span className="text-muted-foreground">{t('introductionsRejected')}</span>
                    <span className="font-semibold text-foreground">{introductionRejected}</span>
                  </div>
                </div>
              </div>
              {isBusinessMember ? (
                <Button asChild variant="outline" className="w-full justify-start rounded-field">
                  <Link href={localizeHref(locale, '/m/introduce')}>
                    {t('businessIntroduction')}
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </section>
      </div>
    </PageWrapper>
  );
}
