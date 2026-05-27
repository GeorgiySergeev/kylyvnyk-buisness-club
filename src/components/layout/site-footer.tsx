// src/components/layout/site-footer.tsx
import { ArrowUpRight, Mail, Phone } from 'lucide-react';
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
      className="relative mt-auto border-t border-primary/10 bg-background text-white py-10 sm:py-12 md:py-16 z-10"
    >
      <div className="kc-container relative">
        {/* Responsive 4-Column Directory Grid - Centered on mobile, left-aligned on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 max-w-6xl mx-auto mb-10 text-center sm:text-left">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col items-center sm:items-start space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center size-10 rounded-full border border-primary/20 bg-[#0a0a0b]/60 backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.04)]">
                <svg viewBox="0 0 100 100" className="size-6 fill-primary text-primary">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    className="opacity-20"
                  />
                  <g transform="translate(20, 20)">
                    <path d="M12 30 L12 34 L48 34 L48 30 L42 16 L30 24 L18 16 Z" />
                  </g>
                </svg>
              </div>
              <h2 className="font-display text-base font-bold tracking-[3px] text-white uppercase leading-none text-left">
                KYLYVNYK
                <span className="block mt-1 font-display font-light text-[9px] tracking-[2px] text-primary uppercase">
                  BUSINESS CLUB
                </span>
              </h2>
            </div>

            <p className="text-[10px] font-semibold tracking-[2px] text-primary/60 uppercase">
              {tFooter('footerTagline')}
            </p>

            <div className="flex flex-col items-center sm:items-start space-y-2 text-xs font-light text-fg/50 pt-1">
              <a
                href="mailto:office@kclub.in"
                className="flex items-center gap-2 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Mail className="size-3.5 text-primary opacity-80" />
                <span>office@kclub.in</span>
              </a>
              <a
                href="tel:+380501234567"
                className="flex items-center gap-2 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Phone className="size-3.5 text-primary opacity-80" />
                <span>+380 50 123 45 67</span>
              </a>
            </div>
          </div>

          {/* Column 2: Explore */}
          <nav aria-label={tA11y('footerNavigation')} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[2px] text-primary/80">
              {tFooter('quickLinksHeading')}
            </h3>
            <ul className="space-y-2.5">
              {PLATFORM_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    className="inline-flex items-center gap-0.5 text-sm font-light text-fg/70 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    href={localizeHref(locale, link.href)}
                  >
                    <span>{tFooter(link.key)}</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3 text-primary/40 opacity-0 -translate-x-1 transition-all duration-300 hover:opacity-100 hover:translate-x-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Legal */}
          <nav aria-label={tFooter('legalHeading')} className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[2px] text-primary/80">
              {tFooter('legalHeading')}
            </h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    className="inline-flex items-center gap-0.5 text-sm font-light text-fg/70 hover:text-primary transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    href={localizeHref(locale, link.href)}
                  >
                    <span>{tFooter(link.key)}</span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3 text-primary/40 opacity-0 -translate-x-1 transition-all duration-300 hover:opacity-100 hover:translate-x-0"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: Newsletter subscription */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[2px] text-primary/80">
              {tFooter('newsletterHeading')}
            </h3>
            <p className="text-sm font-light leading-relaxed text-fg/50">
              {tFooter('newsletterSub')}
            </p>
            <div className="space-y-2 w-full sm:max-w-xs mx-auto sm:mx-0">
              <input
                type="email"
                placeholder={tFooter('newsletterPlaceholder')}
                className="w-full h-11 px-3.5 rounded-lg border border-primary/15 bg-[#0a0a0b]/60 text-sm text-white placeholder-fg/30 transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                required
              />
              <button
                type="button"
                className="w-full h-11 rounded-lg bg-background px-4 text-sm font-bold tracking-wider text-primary uppercase active:scale-[0.98] transition-all cursor-pointer border border-primary/20"
              >
                {tFooter('newsletterCta')}
              </button>
            </div>
          </div>
        </div>

        {/* Footnote rule */}
        <hr className="kc-gold-rule my-8 opacity-15 max-w-6xl mx-auto" />

        {/* Regulatory Warnings Disclaimers block & copyright */}
        <div className="max-w-6xl mx-auto text-center sm:text-left space-y-6">
          <div className="grid gap-2 text-[10px] leading-relaxed text-fg/35 font-light max-w-4xl mx-auto sm:mx-0">
            {LEGAL_KEYS.map((key) => (
              <p key={key}>{tFooter(key)}</p>
            ))}
          </div>

          {/* Copyright line */}
          <p className="text-[10px] tracking-wider text-fg/20 font-light">
            &copy; {year} {tFooter('brand')}. {tFooter('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
