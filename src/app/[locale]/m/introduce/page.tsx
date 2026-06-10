import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { PageBreadcrumbs } from '@/components/navigation/page-breadcrumbs';
import { db } from '@/db/client';
import { businesses, cities, countries, introductions } from '@/db/schema';
import { guardOnboarded } from '@/features/auth/lib/role-guards';
import { userHasActiveVipMembership } from '@/features/billing/lib/membership-lifecycle';
import { IntroductionForm } from '@/features/introductions/components/introduction-form';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface IntroducePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function IntroducePage({ params }: IntroducePageProps) {
  const { locale } = await params;
  const user = await guardOnboarded(locale);

  if (!(await userHasActiveVipMembership(user.id))) {
    redirect(localizeHref(locale, '/m/dashboard'));
  }
  const t = getT('introductions', locale);

  type PublishedBusinessRow = {
    category: { name: string } | null;
    city: { name: string } | null;
    country: { name: string } | null;
    id: string;
    name: string;
  };
  type RecentRequestRow = {
    businessName: string;
    cityName: string | null;
    countryName: string | null;
    createdAt: Date;
    id: string;
    status: string;
  };

  const [publishedBusinesses, recentRequests]: [PublishedBusinessRow[], RecentRequestRow[]] = await Promise.all([
    db.query.businesses.findMany({
      columns: {
        id: true,
        name: true,
      },
      orderBy: [asc(businesses.name)],
      where: and(eq(businesses.status, 'PUBLISHED'), isNull(businesses.deletedAt)),
      with: {
        category: {
          columns: {
            name: true,
          },
        },
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
    db
      .select({
        businessName: businesses.name,
        cityName: cities.name,
        countryName: countries.name,
        createdAt: introductions.createdAt,
        id: introductions.id,
        status: introductions.status,
      })
      .from(introductions)
      .innerJoin(
        businesses,
        and(
          eq(introductions.targetBusinessId, businesses.id),
          eq(businesses.status, 'PUBLISHED'),
          isNull(businesses.deletedAt),
        ),
      )
      .leftJoin(cities, eq(businesses.cityId, cities.id))
      .leftJoin(countries, eq(businesses.countryId, countries.id))
      .where(eq(introductions.requesterId, user.id))
      .orderBy(desc(introductions.createdAt))
      .limit(5),
  ]);

  const businessOptions = publishedBusinesses.map((business) => ({
    category: business.category?.name ?? null,
    city: business.city?.name ?? null,
    country: business.country?.name ?? null,
    id: business.id,
    name: business.name,
  }));

  const dateFormatter = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <PageWrapper>
      <div className="space-y-8">
        <section className="max-w-3xl space-y-4">
          <PageBreadcrumbs currentLabel={t('title')} locale={locale} />
          <div className="space-y-3">
            <h1 className="font-display text-4xl leading-tight text-foreground md:text-5xl">
              {t('title')}
            </h1>
            <p className="text-base leading-7 text-muted-foreground">{t('description')}</p>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="card rounded-box border border-border bg-card shadow-sm">
            <div className="card-body gap-5">
              <div>
                <h2 className="card-title text-xl">{t('formTitle')}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t('formDescription')}
                </p>
              </div>

              {businessOptions.length > 0 ? (
                <IntroductionForm
                  businesses={businessOptions}
                  labels={{
                    clientContact: t('clientContact'),
                    clientContactHelp: t('clientContactHelp'),
                    clientName: t('clientName'),
                    formError: t('formError'),
                    message: t('message'),
                    messageHelp: t('messageHelp'),
                    optional: t('optional'),
                    selectBusiness: t('selectBusiness'),
                    selectPlaceholder: t('selectPlaceholder'),
                    submit: t('submit'),
                    submitting: t('submitting'),
                    success: t('success'),
                  }}
                  locale={locale}
                />
              ) : (
                <div className="rounded-box border border-border bg-background/40 p-5">
                  <h2 className="text-base font-semibold text-foreground">
                    {t('emptyBusinessesTitle')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t('emptyBusinessesDescription')}
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="card rounded-box border border-border bg-card shadow-sm">
            <div className="card-body gap-5">
              <div>
                <h2 className="card-title text-xl">{t('recentTitle')}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t('recentDescription')}
                </p>
              </div>

              {recentRequests.length > 0 ? (
                <div className="overflow-hidden rounded-box border border-border">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>{t('business')}</th>
                        <th>{t('status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((request) => (
                        <tr key={request.id}>
                          <td>
                            <div className="font-medium text-foreground">
                              {request.businessName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {[request.cityName, request.countryName].filter(Boolean).join(' - ') ||
                                t('notSet')}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {t('created')}: {dateFormatter.format(request.createdAt)}
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-outline rounded-field">
                              {request.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-box border border-border bg-background/40 p-5">
                  <h2 className="text-base font-semibold text-foreground">
                    {t('recentEmptyTitle')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t('recentEmptyDescription')}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </PageWrapper>
  );
}
