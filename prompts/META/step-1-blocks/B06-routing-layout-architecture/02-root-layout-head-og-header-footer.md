# 02-root-layout-head-og-header-footer.md

## Title

Root Layout + Metadata + Header/Footer + Mobile Nav

## Objective

Set site-wide metadata (title/OG), build header/footer components with mobile-first navigation, and wire them into public layout.

## Steps

1) Create SEO helper with site URL and default metadata.
2) Patch app/layout.tsx to use metadata and base HTML structure.
3) Implement SiteHeader with compact mode and mobile menu.
4) Implement SiteFooter with legal disclaimers.

## Files to add/modify

- src/lib/seo/site.ts
- src/app/layout.tsx (patch metadata export)
- src/components/layout/site-header.tsx
- src/components/layout/site-footer.tsx

### src/lib/seo/site.ts

```ts
export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export const DEFAULT_SEO = {
  title: 'KYLYVNYK CLUB — International Private Membership Platform',
  description:
    'Save more. Grow your business. Live better. KYLYVNYK CLUB is an independent private membership platform.',
  ogImage: '/og-default.jpg', // replace when asset available
};
```

### src/app/layout.tsx (patch to add metadata)

```tsx
import './globals.css';
import '@/styles/typography.css';
import { ClerkProvider } from '@clerk/nextjs';
import { plusJakarta } from './fonts';
import { ThemeProvider } from '@/components/providers/theme-provider';
import type { Metadata } from 'next';
import { getSiteUrl, DEFAULT_SEO } from '@/lib/seo/site';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: DEFAULT_SEO.title,
  description: DEFAULT_SEO.description,
  openGraph: {
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    type: 'website',
    url: getSiteUrl(),
    images: [{ url: DEFAULT_SEO.ogImage }],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    images: [DEFAULT_SEO.ogImage],
  },
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${plusJakarta.variable} font-sans bg-bg text-fg`}>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### src/components/layout/site-header.tsx

```tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { KylyvnykLogo } from '@/components/icons/brand/kylyvnyk-logo';

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <KylyvnykLogo className="h-7 w-7" />
          {!compact && <span className="font-semibold tracking-wide">KYLYVNYK CLUB</span>}
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/catalog" className="hover:text-gold-400">Partners</Link>
          <Link href="/verify-card" className="hover:text-gold-400">Verify Card</Link>
          <Link href="/sign-in" className="hover:text-gold-400">Sign in</Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold"
          >
            Get a Club Card
          </Link>
        </nav>

        <button
          aria-label="Toggle menu"
          className="sm:hidden rounded-md border border-border px-3 py-2 focus-gold"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="sm:hidden border-t border-border bg-bg">
          <nav className="container py-3 flex flex-col gap-2">
            <Link href="/catalog" onClick={() => setOpen(false)}>Partners</Link>
            <Link href="/verify-card" onClick={() => setOpen(false)}>Verify Card</Link>
            <Link href="/sign-in" onClick={() => setOpen(false)}>Sign in</Link>
            <Link
              href="/sign-up"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold text-center"
            >
              Get a Club Card
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
```

### src/components/layout/site-footer.tsx

```tsx
export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="container py-10 text-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <p className="text-fgMuted">
            KYLYVNYK CLUB is an independent private membership platform. Special conditions are
            provided by independent third-party partners. KYLYVNYK CLUB does not guarantee savings,
            income, commissions, bonuses, clients or business results. Partners are responsible for
            their own licenses, permits and compliance. KYLYVNYK CLUB does not participate in
            transactions, negotiations or agreements between users and partners.
          </p>
          <ul className="space-y-2">
            <li><a className="hover:text-gold-400" href="/legal/terms">Terms of Use</a></li>
            <li><a className="hover:text-gold-400" href="/legal/privacy">Privacy Policy</a></li>
            <li><a className="hover:text-gold-400" href="/legal/cookie">Cookie Policy</a></li>
            <li><a className="hover:text-gold-400" href="/legal/refund">Refund Policy</a></li>
            <li><a className="hover:text-gold-400" href="/legal/rules/club">Club Rules</a></li>
            <li><a className="hover:text-gold-400" href="/contact">Contact Us</a></li>
          </ul>
        </div>
        <div className="mt-6 text-fgMuted">© {new Date().getFullYear()} KYLYVNYK CLUB</div>
      </div>
    </footer>
  );
}
```

## Acceptance

- Header renders with brand and mobile menu.
- Footer contains required legal disclaimers links.
- Metadata populated site-wide (title/OG/Twitter).
