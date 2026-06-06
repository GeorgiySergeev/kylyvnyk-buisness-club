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
      className="relative border-t border-ds-border"
      suppressHydrationWarning
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        suppressHydrationWarning
      />

      <div className="py-8 md:py-12 kc-container" suppressHydrationWarning>
        <div className="mx-auto " suppressHydrationWarning>
          <div className="mb-12 space-y-4 text-center sm:mb-16 md:mb-20" suppressHydrationWarning>
            <span className="block text-[11px] font-normal uppercase tracking-[0.2em] text-ds-text-faint sm:text-ds-text-xs">
              {tFooter('brand')}
            </span>
            <h2 className="font-sans text-3xl font-bold tracking-tight text-ds-text sm:text-4xl md:text-[2.75rem] md:leading-tight">
              {tFooter('footerTagline')}
            </h2>
            <p className="mx-auto max-w-2xl text-ds-text-sm leading-relaxed text-ds-text-muted sm:text-ds-text-base">
              {tFooter('platformCopy')}
            </p>

            <div
              className="flex flex-wrap items-center justify-center gap-ds-space-5 pt-ds-space-2 text-ds-text-sm text-ds-text-muted"
              suppressHydrationWarning
            >
              <a
                className="inline-flex items-center gap-2 transition-ds-transition-fast hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none rounded-ds-radius-sm"
                href="mailto:office@kclub.in"
              >
                <Mail aria-hidden="true" className="size-4 text-ds-text-faint" strokeWidth={1.5} />
                <span>office@kclub.in</span>
              </a>
              <a
                className="inline-flex items-center gap-2 transition-ds-transition-fast hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none rounded-ds-radius-sm"
                href="tel:+380501234567"
              >
                <Phone aria-hidden="true" className="size-4 text-ds-text-faint" strokeWidth={1.5} />
                <span>+380 50 123 45 67</span>
              </a>
            </div>
          </div>

          <div
            className="grid grid-cols-1 border-y border-ds-border md:grid-cols-3"
            suppressHydrationWarning
          >
            <nav
              aria-label={tA11y('footerNavigation')}
              className="px-6 py-8 sm:px-8 sm:py-10 md:px-10"
            >
              <h3 className="mb-4 text-ds-text-sm font-semibold text-ds-text">
                {tFooter('quickLinksHeading')}
              </h3>
              <ul className="space-y-3">
                {PLATFORM_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="inline-flex items-center gap-2 text-ds-text-sm text-ds-text-muted transition-ds-transition-fast hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none rounded-ds-radius-sm"
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
              className="border-t border-ds-border px-6 py-8 sm:px-8 sm:py-10 md:border-t-0 md:border-l md:px-10"
            >
              <h3 className="mb-4 text-ds-text-sm font-semibold text-ds-text">
                {tFooter('legalHeading')}
              </h3>
              <ul className="space-y-3">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="inline-flex items-center gap-2 text-ds-text-sm text-ds-text-muted transition-ds-transition-fast hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none rounded-ds-radius-sm"
                      href={localizeHref(locale, link.href)}
                    >
                      {tFooter(link.key)}
                      <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.25} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div
              className="border-t border-ds-border px-6 py-8 sm:px-8 sm:py-10 md:border-t-0 md:border-l md:px-10"
              suppressHydrationWarning
            >
              <h3 className="mb-4 text-ds-text-sm font-semibold text-ds-text">
                {tFooter('newsletterHeading')}
              </h3>
              <p className="mb-4 text-ds-text-sm leading-relaxed text-ds-text-muted">
                {tFooter('newsletterSub')}
              </p>
              <div className="space-y-3" suppressHydrationWarning>
                <input
                  className="h-11 w-full rounded-ds-radius-md border border-ds-border bg-transparent px-ds-space-4 text-ds-text-sm text-ds-text placeholder:text-ds-text-faint transition-ds-transition-fast focus-visible:border-ds-accent focus-visible:ring-[3px] focus-visible:ring-ds-accent-subtle focus-visible:outline-none"
                  placeholder={tFooter('newsletterPlaceholder')}
                  required
                  type="email"
                />
                <button
                  className="inline-flex h-11 w-full items-center justify-center gap-ds-space-2 rounded-ds-radius-md border border-ds-border text-ds-text-sm font-semibold text-ds-text transition-ds-transition-fast hover:bg-ds-surface-hover focus-visible:border-ds-accent focus-visible:ring-[3px] focus-visible:ring-ds-accent-subtle focus-visible:outline-none"
                  type="button"
                >
                  {tFooter('newsletterCta')}
                  <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.25} />
                </button>
              </div>
            </div>
          </div>

          <div
            className="mt-10 space-y-6 border-t border-ds-border pt-10 sm:mt-12 sm:pt-12"
            suppressHydrationWarning
          >
            <p className="text-center text-[11px] text-ds-text-muted sm:text-ds-text-xs sm:text-left">
              &copy; {year} {tFooter('brand')}. {tFooter('allRightsReserved')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
