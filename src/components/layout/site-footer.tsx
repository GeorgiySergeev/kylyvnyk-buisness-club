import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  ChartNoAxesCombined,
  CreditCard,
  Fingerprint,
  LockKeyhole,
} from 'lucide-react';
import Link from 'next/link';

import { getT } from '@/lib/i18n/t-server';

import { localizeHref, type SupportedLocale } from './navigation';

const PLATFORM_LINKS = [
  {
    href: '/',
    key: 'home',
  },
  {
    href: '/directory',
    key: 'directory',
  },
  {
    href: '/verify-card',
    key: 'verifyCard',
  },
  {
    href: '/m/introduce',
    key: 'businessIntroduction',
  },
] as const;

const FOOTER_LINKS = [
  {
    href: '/legal/terms',
    key: 'termsOfUse',
  },
  {
    href: '/legal/privacy',
    key: 'privacyPolicy',
  },
  {
    href: '/legal/cookie',
    key: 'cookiePolicy',
  },
  {
    href: '/legal/contact',
    key: 'contactUs',
  },
] as const;

const PLATFORM_SIGNALS = [
  {
    icon: Fingerprint,
    key: 'platformSignal1',
  },
  {
    icon: LockKeyhole,
    key: 'platformSignal2',
  },
  {
    icon: Building2,
    key: 'platformSignal3',
  },
] as const;

const FOOTER_METRICS = [
  {
    valueKey: 'metric1Value',
    labelKey: 'metric1Label',
  },
  {
    valueKey: 'metric2Value',
    labelKey: 'metric2Label',
  },
  {
    valueKey: 'metric3Value',
    labelKey: 'metric3Label',
  },
] as const;

const LEGAL_KEYS = [
  'legalLine1',
  'legalLine2',
  'legalLine3',
  'legalLine4',
  'legalLine5',
  'legalLine6',
] as const;

interface SiteFooterProps {
  locale: SupportedLocale;
}

export function SiteFooter({ locale }: SiteFooterProps) {
  const tA11y = getT('a11y');
  const tFooter = getT('footer');
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label={tA11y('siteFooter')}
      className="kc-fintech-footer relative mt-auto overflow-hidden border-t border-fintech-soft-gold/30 text-white"
    >
      <div className="kc-fintech-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="kc-container relative py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(22rem,0.98fr)] lg:items-end">
          <section className="max-w-4xl space-y-8" aria-labelledby="footer-brand-heading">
            <Link
              className="group inline-flex min-h-11 items-center gap-3 rounded-md border border-fintech-soft-gold/35 bg-fintech-black/70 px-4 py-2 text-white backdrop-blur-xl transition-colors hover:border-fintech-gold/70 hover:bg-fintech-charcoal/70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fintech-gold"
              href={localizeHref(locale, '/')}
            >
              <span className="kc-fintech-glow flex size-9 items-center justify-center rounded-md border border-fintech-gold/45 bg-fintech-gold/12 text-fintech-gold transition-transform duration-200 group-hover:scale-[1.03]">
                <CreditCard aria-hidden="true" className="size-4" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-sm font-semibold text-fintech-gold">
                  {tFooter('brand')}
                </span>
                <span className="mt-1 text-[0.68rem] font-medium uppercase text-white/56">
                  {tFooter('brandSubtitle')}
                </span>
              </span>
            </Link>

            <div className="space-y-5">
              <p className="inline-flex min-h-8 items-center rounded-md border border-fintech-gold/25 bg-fintech-gold/10 px-4 text-sm font-medium text-fintech-gold">
                {tFooter('platformBadge')}
              </p>
              <h2
                id="footer-brand-heading"
                className="max-w-4xl font-display text-4xl font-semibold leading-[1.07] text-white md:text-6xl"
              >
                {tFooter('platformHeading')}
              </h2>
              <p className="max-w-2xl text-base leading-7 text-white/62 md:text-lg">
                {tFooter('platformCopy')}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="kc-fintech-glow inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-fintech-gold px-6 text-sm font-semibold text-fintech-black transition-transform duration-200 hover:translate-y-[-1px] hover:bg-fintech-soft-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fintech-gold"
                href={localizeHref(locale, '/sign-up')}
              >
                {tFooter('joinNow')}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-fintech-soft-gold/35 px-6 text-sm font-semibold text-white transition-colors hover:border-fintech-gold/70 hover:bg-fintech-gold/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fintech-gold"
                href={localizeHref(locale, '/sign-in')}
              >
                {tFooter('signIn')}
              </Link>
            </div>
          </section>

          <section
            aria-labelledby="footer-platform-signals"
            className="rounded-lg border border-fintech-soft-gold/25 bg-fintech-charcoal/45 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-5"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h2
                  id="footer-platform-signals"
                  className="text-sm font-semibold uppercase text-fintech-soft-gold"
                >
                  {tFooter('platformSignalsHeading')}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/62">
                  {tFooter('securityCopy')}
                </p>
              </div>
              <span className="hidden size-12 items-center justify-center rounded-md border border-fintech-gold/30 bg-fintech-gold/10 text-fintech-gold sm:flex">
                <ChartNoAxesCombined aria-hidden="true" className="size-5" />
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_12rem]">
              <div className="grid gap-3">
                {PLATFORM_SIGNALS.map(({ icon: Icon, key }) => (
                  <div
                    key={key}
                    className="grid min-h-16 grid-cols-[2.75rem_1fr] items-center gap-4 rounded-md border border-white/10 bg-fintech-black/45 px-4 py-3"
                  >
                    <span className="flex size-11 items-center justify-center rounded-md border border-fintech-gold/25 bg-fintech-gold/10 text-fintech-gold">
                      <Icon aria-hidden="true" className="size-4" />
                    </span>
                    <p className="text-sm leading-5 text-white/74">{tFooter(key)}</p>
                  </div>
                ))}
              </div>

              <div
                className="flex min-h-48 items-end gap-2 rounded-md border border-white/10 bg-fintech-black/55 p-4"
                aria-hidden="true"
              >
                {[42, 68, 54, 82, 64, 94].map((height, index) => (
                  <span
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-fintech-soft-gold/45 to-fintech-gold"
                    key={`${height}-${index}`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {FOOTER_METRICS.map((metric) => (
                <div
                  className="rounded-md border border-white/10 bg-white/5 px-4 py-3"
                  key={metric.valueKey}
                >
                  <p className="font-display text-2xl font-semibold text-fintech-gold">
                    {tFooter(metric.valueKey)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/55">{tFooter(metric.labelKey)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="relative border-t border-fintech-soft-gold/20 bg-fintech-black/82 text-white backdrop-blur">
        <div className="kc-container py-10 md:py-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <div className="inline-flex size-12 items-center justify-center rounded-md border border-fintech-gold/35 bg-fintech-gold/10 text-fintech-gold">
                <BadgeCheck aria-hidden="true" className="size-5" />
              </div>
              <p className="max-w-sm font-display text-2xl font-semibold leading-[1.12] md:text-3xl">
                {tFooter('footerTagline')}
              </p>
              <p className="text-sm leading-6 text-white/58">
                {year} {tFooter('brand')}. {tFooter('allRightsReserved')}
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <nav aria-label={tA11y('footerNavigation')} className="space-y-4">
                <h2 className="text-sm font-semibold uppercase text-fintech-soft-gold/80">
                  {tFooter('quickLinksHeading')}
                </h2>
                <ul className="grid gap-2">
                  {PLATFORM_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="group flex min-h-11 items-center justify-between gap-3 rounded-md px-4 text-sm font-medium text-white/68 transition-colors hover:bg-fintech-gold/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fintech-gold"
                        href={localizeHref(locale, link.href)}
                      >
                        {tFooter(link.key)}
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-3.5 text-fintech-gold transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label={tFooter('legalHeading')} className="space-y-4">
                <h2 className="text-sm font-semibold uppercase text-fintech-soft-gold/80">
                  {tFooter('legalHeading')}
                </h2>
                <ul className="grid gap-2">
                  {FOOTER_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        className="group flex min-h-11 items-center justify-between gap-3 rounded-md px-4 text-sm font-medium text-white/68 transition-colors hover:bg-fintech-gold/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fintech-gold"
                        href={localizeHref(locale, link.href)}
                      >
                        {tFooter(link.key)}
                        <ArrowUpRight
                          aria-hidden="true"
                          className="size-3.5 text-fintech-gold transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-3xl border-t border-fintech-soft-gold/20 pt-8 text-center">
            <div className="grid gap-1.5">
              {LEGAL_KEYS.map((key) => (
                <p key={key} className="text-[11px] leading-relaxed text-white/38">
                  {tFooter(key)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
