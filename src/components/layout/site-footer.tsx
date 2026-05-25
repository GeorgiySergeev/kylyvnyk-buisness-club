import Link from 'next/link';

import { getT } from '@/lib/i18n/t-server';

import { localizeHref, type SupportedLocale } from './navigation';

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
    <footer aria-label={tA11y('siteFooter')} className="mt-auto border-t border-border/70 bg-base-200/70">
      <div className="kc-container py-10">
        <div className="rounded-box border border-border/60 bg-card p-6 shadow-xl shadow-black/10 md:p-8">
          <div className="footer items-start gap-8 border-b border-border/60 pb-8">
            <aside className="max-w-md">
              <p className="font-display text-lg tracking-[3px] text-primary">{tFooter('brand')}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {year} {tFooter('brand')}. {tFooter('allRightsReserved')}
              </p>
            </aside>

            <nav aria-label={tA11y('footerNavigation')}>
              <h6 className="footer-title text-primary/80">Legal</h6>
              <ul className="menu gap-1 p-0">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="rounded-btn min-h-11 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      href={localizeHref(locale, link.href)}
                    >
                      {tFooter(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-8 grid gap-3">
            {LEGAL_KEYS.map((key) => (
              <p key={key} className="text-sm leading-6 text-muted-foreground">
                {tFooter(key)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
