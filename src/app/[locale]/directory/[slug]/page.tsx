import { notFound } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { PageBreadcrumbs } from '@/components/navigation/page-breadcrumbs';
import { getCurrentUser } from '@/features/auth/lib/current-user';
import { getBusinessBySlug } from '@/features/directory/lib/get-business-by-slug';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface DirectoryDetailPageProps {
  params: Promise<{
    locale: SupportedLocale;
    slug: string;
  }>;
}

export default async function DirectoryDetailPage({ params }: DirectoryDetailPageProps) {
  const { locale, slug } = await params;
  const t = getT('directory', locale);
  const [business, user] = await Promise.all([
    getBusinessBySlug(decodeURIComponent(slug)),
    getCurrentUser(),
  ]);

  if (!business) {
    notFound();
  }

  const location = [business.city?.name, business.country?.name].filter(Boolean).join(', ');

  return (
    <PageWrapper>
      <article className="mx-auto max-w-5xl space-y-6">
        <PageBreadcrumbs
          currentLabel={business.name}
          locale={locale}
          parents={[{ label: t('title'), href: localizeHref(locale, '/directory') }]}
        />

        <section className="card border border-border bg-card shadow-sm">
          <div className="card-body gap-6 p-5 md:p-8">
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_16rem] md:items-start">
              <div className="space-y-4">
                <div className="space-y-3">
                  <h1 className="font-display text-4xl leading-tight text-foreground md:text-5xl">
                    {business.name}
                  </h1>
                  <div className="flex flex-wrap gap-2">
                    {business.category ? (
                      <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
                        {business.category.name}
                      </span>
                    ) : null}
                    {business.isTopPartner ? (
                      <span className="rounded-md bg-ds-brand-subtle px-2 py-0.5 text-xs font-semibold text-ds-brand">
                        {t('topPartner')}
                      </span>
                    ) : null}
                    {business.isRecommended ? (
                      <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
                        {t('recommended')}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <aside className="rounded-lg border border-border bg-ds-surface-2 p-4">
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {t('countryLabel')}
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {[business.country?.flagEmoji, location || t('locationFallback')]
                        .filter(Boolean)
                        .join(' ')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {t('categoryLabel')}
                    </dt>
                    <dd className="mt-1 text-foreground">
                      {business.category?.name ?? t('categoryFallback')}
                    </dd>
                  </div>
                  {business.website ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {t('website')}
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-ds-accent underline underline-offset-2 hover:text-ds-accent-hover"
                        >
                          {business.website}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </aside>
            </div>

            <div className={user ? 'grid gap-4 md:grid-cols-[minmax(0,1fr)_20rem]' : 'grid gap-4'}>
              <section className="rounded-lg border border-border bg-background/40 p-5">
                <h2 className="text-lg font-semibold text-foreground">{t('about')}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {business.description}
                </p>
              </section>
              {user ? (
                <section className="rounded-lg border border-ds-accent/30 bg-ds-accent-subtle p-5">
                  <h2 className="text-lg font-semibold text-foreground">{t('specialConditions')}</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {business.discountLabel ?? t('specialConditionsFallback')}
                  </p>
                </section>
              ) : null}
            </div>

            <p className="border-t border-border pt-4 text-xs leading-6 text-muted-foreground">
              {t('publicProfileNote')}
            </p>
          </div>
        </section>
      </article>
    </PageWrapper>
  );
}
