// src/components/layout/site-footer.tsx
import { ArrowRight, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

import { getT } from '@/lib/i18n/t-server';

import { type SupportedLocale, localizeHref } from './navigation';

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
  const tA11y = getT('a11y', locale);
  const tFooter = getT('footer', locale);
  const year = new Date().getFullYear();

  return (
    <footer
      aria-label={tA11y('siteFooter')}
      className=" border-t border-border/50 bg-fintech-black"
    >
      <div className=" pointer-events-none absolute inset-0 " aria-hidden="true" />

      <div className="  py-16 sm:py-20 md:py-24 kc-container ">
        <div className="mx-auto ">
          <div className="mb-12 space-y-4 text-center sm:mb-16 md:mb-20">
            <span className="block text-[11px] font-normal uppercase tracking-[0.2em] text-fg/45 sm:text-xs">
              {tFooter('brand')}
            </span>
            <h2 className="font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-tight">
              {tFooter('footerTagline')}
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-fg/50 sm:text-base">
              {tFooter('platformCopy')}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-5 pt-2 text-sm text-fg/50">
              <a
                className="inline-flex items-center gap-2 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href="mailto:office@kclub.in"
              >
                <Mail aria-hidden="true" className="size-4 text-fg/35" strokeWidth={1.5} />
                <span>office@kclub.in</span>
              </a>
              <a
                className="inline-flex items-center gap-2 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                href="tel:+380501234567"
              >
                <Phone aria-hidden="true" className="size-4 text-fg/35" strokeWidth={1.5} />
                <span>+380 50 123 45 67</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 border-y border-border/50 md:grid-cols-3">
            <nav
              aria-label={tA11y('footerNavigation')}
              className="px-6 py-8 sm:px-8 sm:py-10 md:px-10"
            >
              <h3 className="mb-4 text-sm font-semibold text-white">
                {tFooter('quickLinksHeading')}
              </h3>
              <ul className="space-y-3">
                {PLATFORM_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="inline-flex items-center gap-2 text-sm text-fg/50 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      href={localizeHref(locale, link.href)}
                    >
                      {tFooter(link.key)}
                      <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.25} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav
              aria-label={tFooter('legalHeading')}
              className="border-t border-border/50 px-6 py-8 sm:px-8 sm:py-10 md:border-t-0 md:border-l md:px-10"
            >
              <h3 className="mb-4 text-sm font-semibold text-white">{tFooter('legalHeading')}</h3>
              <ul className="space-y-3">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="inline-flex items-center gap-2 text-sm text-fg/50 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      href={localizeHref(locale, link.href)}
                    >
                      {tFooter(link.key)}
                      <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.25} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-border/50 px-6 py-8 sm:px-8 sm:py-10 md:border-t-0 md:border-l md:px-10">
              <h3 className="mb-4 text-sm font-semibold text-white">
                {tFooter('newsletterHeading')}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-fg/50">{tFooter('newsletterSub')}</p>
              <div className="space-y-3">
                <input
                  className="h-11 w-full rounded-md border border-border/50 bg-transparent px-3.5 text-sm text-white placeholder:text-fg/30 transition-colors focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/10"
                  placeholder={tFooter('newsletterPlaceholder')}
                  required
                  type="email"
                />
                <button
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border/50 text-sm font-semibold text-white transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  type="button"
                >
                  {tFooter('newsletterCta')}
                  <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.25} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 space-y-6 border-t border-border/50 pt-10 sm:mt-12 sm:pt-12">
            {/* <div className="mx-auto grid max-w-4xl gap-2 text-[11px] leading-relaxed text-fg/35 sm:text-xs">
              {LEGAL_KEYS.map((key) => (
                <p key={key}>{tFooter(key)}</p>
              ))}
            </div> */}

            <p className="text-center text-[11px] text-fg/30 sm:text-left sm:text-xs">
              &copy; {year} {tFooter('brand')}. {tFooter('allRightsReserved')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
