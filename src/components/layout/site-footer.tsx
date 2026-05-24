import Link from 'next/link';

import { getT } from '@/lib/i18n/t-server';

import { localizeHref,type SupportedLocale } from './navigation';

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
  const tA11y = getT('a11y');
  const tFooter = getT('footer');
  const year = new Date().getFullYear();

  return (
    <footer aria-label={tA11y('siteFooter')} className="mt-auto border-t border-border/70 bg-card">
      <div className="kc-container py-10">
        <div className="flex flex-col gap-6 border-b border-border/60 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold tracking-[0.32em] text-primary uppercase">
              {tFooter('brand')}
            </p>
            <p className="text-xs text-muted-foreground">
              {year} {tFooter('brand')}. {tFooter('allRightsReserved')}
            </p>
          </div>

          <nav aria-label={tA11y('footerNavigation')}>
            <ul className="flex flex-wrap gap-x-6 gap-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={localizeHref(locale, link.href)}
                    className="min-h-11 rounded-md py-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {tFooter(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 space-y-3">
          {LEGAL_KEYS.map((key) => (
            <p key={key} className="text-sm leading-6 text-muted-foreground">
              {tFooter(key)}
            </p>
          ))}
        </div>
      </div>
    </footer>
  );
}
