import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { db } from '@/db/client';
import { getPublishedBusinesses } from '@/features/directory/lib/get-published-businesses';
import type { PublicBusinessDto } from '@/features/directory/lib/public-business-dto';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface DirectoryPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    category?: string;
    country?: string;
    q?: string;
  }>;
}

function parsePositiveInteger(value?: string): number | undefined {
  if (!value) return undefined;

  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function buildFilterHref(
  locale: SupportedLocale,
  next: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(next)) {
    if (value !== undefined && `${value}`.trim()) {
      params.set(key, `${value}`);
    }
  }

  const query = params.toString();
  return `${localizeHref(locale, '/directory')}${query ? `?${query}` : ''}`;
}

function BusinessCard({
  business,
  locale,
}: {
  business: PublicBusinessDto;
  locale: SupportedLocale;
}) {
  const t = getT('directory', locale);
  const location = [business.city?.name, business.country?.name].filter(Boolean).join(', ');
  const fallbackInitial = business.name.slice(0, 1).toUpperCase();

  return (
    <article className="card border border-border/80 bg-card text-card-foreground shadow-sm">
      <div className="card-body gap-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-box border border-primary/25 bg-base-300 text-sm font-semibold text-primary">
              {business.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={business.logoUrl} alt="" className="size-full rounded-box object-cover" />
              ) : (
                fallbackInitial
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <h2 className="truncate text-base font-semibold text-foreground">{business.name}</h2>
              <p className="text-sm text-muted-foreground">
                {business.category?.name ?? t('categoryFallback')}
              </p>
            </div>
          </div>
          {business.country?.flagEmoji ? (
            <span className="text-lg" aria-label={business.country.iso2}>
              {business.country.flagEmoji}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {business.isTopPartner ? (
            <span className="badge badge-primary badge-sm rounded-selector">{t('topPartner')}</span>
          ) : null}
          {business.isRecommended ? (
            <span className="badge badge-outline badge-sm rounded-selector">
              {t('recommended')}
            </span>
          ) : null}
        </div>

        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground">
          {business.description}
        </p>

        <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
          <p className="min-w-0 truncate text-sm text-muted-foreground">
            {location || t('locationFallback')}
          </p>
          <Button asChild size="sm" variant="outline" className="shrink-0 rounded-field">
            <Link href={localizeHref(locale, `/directory/${business.slug}`)}>{t('details')}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export default async function DirectoryPage({ params, searchParams }: DirectoryPageProps) {
  const { locale } = await params;
  const { category, country, q } = await searchParams;
  const t = getT('directory', locale);
  const search = q?.trim().slice(0, 80) || undefined;
  const categoryId = parsePositiveInteger(category);
  const countryId = parsePositiveInteger(country);

  const [businesses, categoryOptions, countryOptions] = await Promise.all([
    getPublishedBusinesses({ categoryId, countryId, search, limit: 24 }),
    db.query.categories.findMany({
      columns: { id: true, name: true },
      orderBy: (categories, { asc }) => [asc(categories.name)],
    }),
    db.query.countries.findMany({
      columns: { flagEmoji: true, id: true, name: true },
      orderBy: (countries, { asc }) => [asc(countries.name)],
    }),
  ]);

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
            <div className="stat">
              <div className="stat-title text-muted-foreground">{t('resultsCount')}</div>
              <div className="stat-value text-3xl text-primary">{businesses.length}</div>
            </div>
          </div>
        </section>

        <form
          className="card border border-border bg-card shadow-sm"
          action={localizeHref(locale, '/directory')}
        >
          <div className="card-body grid gap-4 p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(12rem,0.8fr)_minmax(12rem,0.8fr)_auto_auto] md:items-end">
            <label className="form-control">
              <span className="label pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('searchLabel')}
              </span>
              <input
                className="input input-bordered w-full rounded-field bg-background"
                defaultValue={search ?? ''}
                maxLength={80}
                name="q"
                placeholder={t('searchPlaceholder')}
                type="search"
              />
            </label>

            <label className="form-control">
              <span className="label pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('categoryLabel')}
              </span>
              <select
                className="select select-bordered w-full rounded-field bg-background"
                defaultValue={categoryId ?? ''}
                name="category"
              >
                <option value="">{t('allCategories')}</option>
                {categoryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-control">
              <span className="label pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('countryLabel')}
              </span>
              <select
                className="select select-bordered w-full rounded-field bg-background"
                defaultValue={countryId ?? ''}
                name="country"
              >
                <option value="">{t('allCountries')}</option>
                {countryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {[option.flagEmoji, option.name].filter(Boolean).join(' ')}
                  </option>
                ))}
              </select>
            </label>

            <Button type="submit" className="rounded-field">
              {t('applyFilters')}
            </Button>
            <Button asChild variant="outline" className="rounded-field">
              <Link href={buildFilterHref(locale, {})}>{t('clearFilters')}</Link>
            </Button>
          </div>
        </form>

        {businesses.length > 0 ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} locale={locale} />
            ))}
          </section>
        ) : (
          <section className="card border border-border bg-card shadow-sm">
            <div className="card-body items-start gap-3 p-6">
              <h2 className="text-xl font-semibold text-foreground">{t('emptyTitle')}</h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {t('emptyDescription')}
              </p>
              <Button asChild variant="outline" className="rounded-field">
                <Link href={localizeHref(locale, '/directory')}>{t('clearFilters')}</Link>
              </Button>
            </div>
          </section>
        )}
      </div>
    </PageWrapper>
  );
}
