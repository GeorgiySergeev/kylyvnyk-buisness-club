import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { getT } from '@/lib/i18n/t-server';

const ACTIONS = [
  ['memberAction', '/sign-up', '01'],
  ['vipAction', '/sign-up', '02'],
  ['partnerAction', '/directory', '03'],
] as const;

const STATS = [
  ['statMembersValue', 'statMembersLabel'],
  ['statCountriesValue', 'statCountriesLabel'],
  ['statPartnersValue', 'statPartnersLabel'],
] as const;

const TOP_PARTNERS = [
  ['topPartnerOneName', 'topPartnerOneCategory', 'topPartnerOneLocation', 'topPartnerOneCondition'],
  ['topPartnerTwoName', 'topPartnerTwoCategory', 'topPartnerTwoLocation', 'topPartnerTwoCondition'],
  [
    'topPartnerThreeName',
    'topPartnerThreeCategory',
    'topPartnerThreeLocation',
    'topPartnerThreeCondition',
  ],
] as const;

const STEPS = [
  ['stepOneTitle', 'stepOneText'],
  ['stepTwoTitle', 'stepTwoText'],
  ['stepThreeTitle', 'stepThreeText'],
  ['stepFourTitle', 'stepFourText'],
] as const;

const FILTERS = ['filterCountry', 'filterCity', 'filterCategory', 'filterStatus'] as const;

const RECOMMENDED_PARTNERS = [
  ['recommendedPartnerOneName', 'recommendedPartnerOneMeta'],
  ['recommendedPartnerTwoName', 'recommendedPartnerTwoMeta'],
  ['recommendedPartnerThreeName', 'recommendedPartnerThreeMeta'],
] as const;

const BOTTOM_NAV = [
  ['bottomHome', '/'],
  ['bottomDirectory', '/directory'],
  ['bottomCard', '/verify-card'],
] as const;

interface LocaleHomePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

export default async function LocaleHomePage({ params }: LocaleHomePageProps) {
  const { locale } = await params;
  const tHome = getT('home');

  return (
    <PageWrapper flush className="!px-0 pb-28 md:pb-24">
      <div className="mx-5 max-w-6xl space-y-8 overflow-hidden sm:mx-8 lg:mx-auto">
        <section className="relative min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-black/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--secondary)_0%,var(--background)_58%)]" />
          <div className="relative grid min-w-0 gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center lg:px-10 lg:py-12">
            <div className="min-w-0 space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-[0.32em] text-primary uppercase">
                  {tHome('eyebrow')}
                </p>
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/35 bg-background/70 shadow-xl shadow-primary/10 sm:h-32 sm:w-32">
                  <span className="font-display text-3xl text-primary sm:text-4xl">KC</span>
                </div>
                <p className="font-display text-2xl leading-tight text-primary sm:text-3xl">
                  {tHome('slogan')}
                </p>
                <h1 className="max-w-3xl text-wrap font-display text-3xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
                  {tHome('headline')}
                </h1>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                  {tHome('subline')}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                {ACTIONS.map(([labelKey, href, index]) => (
                  <Link
                    key={labelKey}
                    href={localizeHref(locale, href)}
                    className="flex min-h-16 items-center gap-3 rounded-md bg-primary px-4 py-3 text-left text-sm font-bold text-primary-foreground shadow-lg shadow-black/30 transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-background/15 font-mono text-xs">
                      {index}
                    </span>
                    {tHome(labelKey)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="min-w-0 rounded-lg border border-primary/30 bg-background/70 p-5">
              <div className="space-y-5 rounded-lg border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                      {tHome('cardLabel')}
                    </p>
                    <p className="font-display text-3xl text-foreground">{tHome('cardStatus')}</p>
                  </div>
                  <div className="h-12 w-12 rounded-md border border-primary/40 bg-primary/15" />
                </div>
                <p className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-muted-foreground">
                  {tHome('cardNumber')}
                </p>
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-primary" />
                  <div className="h-2 w-4/5 rounded-full bg-foreground/20" />
                  <div className="h-2 w-3/5 rounded-full bg-foreground/10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card/80 p-5">
          <h2 className="text-center text-sm font-bold tracking-[0.28em] text-primary uppercase">
            {tHome('statsTitle')}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {STATS.map(([valueKey, labelKey]) => (
              <div
                key={valueKey}
                className="mx-auto flex aspect-square w-full max-w-44 flex-col items-center justify-center rounded-full border border-primary/35 bg-background/70 p-6 text-center shadow-lg shadow-black/20"
              >
                <p className="font-display text-2xl text-foreground">{tHome(valueKey)}</p>
                <p className="mt-2 text-xs font-bold tracking-[0.2em] text-primary uppercase">
                  {tHome(labelKey)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-center text-sm font-bold tracking-[0.28em] text-primary uppercase">
            {tHome('topPartnersTitle')}
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {TOP_PARTNERS.map(([nameKey, categoryKey, locationKey, conditionKey], index) => (
              <article
                key={nameKey}
                className="rounded-lg border border-border bg-background/70 p-4"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 font-mono text-xs text-primary">
                  {index + 1}
                </div>
                <h3 className="text-sm font-bold text-foreground">{tHome(nameKey)}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{tHome(categoryKey)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{tHome(locationKey)}</p>
                <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-primary">
                  {tHome(conditionKey)}
                </p>
                <Link
                  href={localizeHref(locale, '/directory')}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md border border-primary/40 px-4 py-2 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {tHome('detailsCta')}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card/80 p-5">
          <h2 className="text-center text-sm font-bold tracking-[0.28em] text-primary uppercase">
            {tHome('howTitle')}
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([titleKey, textKey], index) => (
              <div
                key={titleKey}
                className="rounded-md border border-border bg-background/70 p-4 text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-primary/40 bg-primary/10 font-mono text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground uppercase">
                  {tHome(titleKey)}
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{tHome(textKey)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-center text-sm font-bold tracking-[0.28em] text-primary uppercase">
            {tHome('searchTitle')}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {FILTERS.map((filterKey) => (
              <div
                key={filterKey}
                className="flex min-h-11 items-center justify-between rounded-md border border-border bg-background px-3 text-sm text-muted-foreground"
              >
                {tHome(filterKey)}
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rotate-45 border-r border-b border-primary"
                />
              </div>
            ))}
          </div>
          <Link
            href={localizeHref(locale, '/directory')}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {tHome('searchCta')}
          </Link>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-bold tracking-[0.28em] text-primary uppercase">
              {tHome('recommendedTitle')}
            </h2>
            <Link
              href={localizeHref(locale, '/directory')}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {tHome('showMoreCta')}
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {RECOMMENDED_PARTNERS.map(([nameKey, metaKey]) => (
              <article
                key={nameKey}
                className="rounded-lg border border-border bg-background/70 p-4"
              >
                <div className="mb-4 h-12 rounded-md border border-primary/25 bg-primary/10" />
                <h3 className="text-sm font-bold text-foreground">{tHome(nameKey)}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{tHome(metaKey)}</p>
                <p className="mt-4 border-t border-border pt-3 text-xs leading-5 text-primary">
                  {tHome('recommendedCondition')}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 overflow-hidden border-t border-border bg-background/95 px-2 py-2 backdrop-blur md:hidden">
        <ul className="mx-auto grid w-full max-w-sm grid-cols-3 gap-1">
          {BOTTOM_NAV.map(([labelKey, href], index) => (
            <li key={labelKey}>
              <Link
                href={localizeHref(locale, href)}
                className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted-foreground'}`}
                />
                {tHome(labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </PageWrapper>
  );
}
