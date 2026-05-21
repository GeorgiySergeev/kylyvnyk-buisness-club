# 01-next-intl-skeleton-and-namespaces.md

## Title

next-intl skeleton — single-locale MVP with feature namespaces

## Objective

Add a minimal next-intl setup for a single-locale MVP (en) that is easy to extend to multiple locales later. Provide feature-based message namespaces.

## Steps

1. Install next-intl.
2. Create i18n config (locales, default).
3. Add messages by feature namespace.
4. Create IntlProvider wrapper and wire it in RootLayout with default messages.
5. Provide a tiny t() usage example.

## Commands

```bash
pnpm add next-intl
```

## Files to add/modify

- src/i18n/config.ts
- src/i18n/messages/en/common.json
- src/i18n/messages/en/landing.json
- src/i18n/messages/en/legal.json
- src/i18n/messages/en/nav.json
- src/i18n/messages/en/catalog.json
- src/i18n/messages/en/index.ts
- src/components/providers/intl-provider.tsx
- src/app/layout.tsx (wrap with IntlProvider)
- src/features/\_examples/i18n/demo.tsx (optional demo)

### src/i18n/config.ts

```ts
export const i18n = {
  locales: ['en'] as const,
  defaultLocale: 'en' as const,
};

export type Locale = (typeof i18n)['locales'][number];
```

### src/i18n/messages/en/common.json

```json
{
  "brand": "KYLYVNYK CLUB",
  "saveGrowLive": "Save more. Grow your business. Live better.",
  "cta": {
    "getCardFree": "Get a Club Card — Free",
    "becomeVip": "Become VIP — $19.99/mo",
    "submitBusiness": "Submit a Business — from $19.99/mo",
    "openCatalog": "Open Catalog",
    "upgradeVip": "Upgrade to VIP — $19.99/mo",
    "moreDetails": "More details",
    "showMore": "Show more",
    "viewAll": "View all"
  },
  "general": {
    "members": "Members",
    "countries": "Countries",
    "partners": "Partners"
  }
}
```

### src/i18n/messages/en/landing.json

```json
{
  "hero": {
    "headline": "Save more. Grow your business. Live better.",
    "subline": "International private membership platform and premium partner network."
  },
  "recommended": {
    "title": "Recommended",
    "note": "Special conditions are available after registration."
  },
  "topPartners": {
    "title": "Top Partners"
  },
  "legalNote": "KYLYVNYK CLUB is an independent private membership platform. Special conditions are provided by independent third-party partners."
}
```

### src/i18n/messages/en/legal.json

```json
{
  "footer": {
    "platform": "KYLYVNYK CLUB is an independent private membership platform.",
    "notEmployerInvestment": "KYLYVNYK CLUB is not an employer, investment platform, MLM company or guarantee-of-income system.",
    "specialConditions": "Special conditions are provided directly by independent third-party partners.",
    "noGuarantees": "KYLYVNYK CLUB does not guarantee savings, income, commissions, bonuses, clients or business results.",
    "partnerResponsibility": "Partners independently provide their own services and are responsible for their own licenses, permits and compliance.",
    "noParticipation": "KYLYVNYK CLUB does not participate in transactions, negotiations or agreements between users and partners."
  }
}
```

### src/i18n/messages/en/nav.json

```json
{
  "nav": {
    "partners": "Partners",
    "verifyCard": "Verify Card",
    "signIn": "Sign in",
    "getCard": "Get a Club Card"
  }
}
```

### src/i18n/messages/en/catalog.json

```json
{
  "catalog": {
    "title": "Partners Catalog",
    "note": "Special conditions are available to club members after sign‑in.",
    "filters": {
      "allCountries": "All Countries",
      "allCities": "All Cities",
      "allCategories": "All Categories",
      "findPartner": "Find partner",
      "reset": "Reset"
    },
    "empty": "No partners found. Try adjusting filters or reset."
  }
}
```

### src/i18n/messages/en/index.ts

```ts
import catalog from './catalog.json';
import common from './common.json';
import landing from './landing.json';
import legal from './legal.json';
import nav from './nav.json';

export const enMessages = {
  common,
  landing,
  legal,
  nav,
  catalog,
} as const;

export type Messages = typeof enMessages;
```

### src/components/providers/intl-provider.tsx

```tsx
'use client';

import { NextIntlClientProvider } from 'next-intl';

import type { Messages } from '@/i18n/messages/en';

export function IntlProvider({
  messages,
  children,
}: {
  messages: Messages;
  children: React.ReactNode;
}) {
  return <NextIntlClientProvider messages={messages as any}>{children}</NextIntlClientProvider>;
}
```

### src/app/layout.tsx (patch)

```tsx
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';

import { IntlProvider } from '@/components/providers/intl-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { enMessages } from '@/i18n/messages/en';
import { DEFAULT_SEO, getSiteUrl } from '@/lib/seo/site';
import '@/styles/typography.css';

import { plusJakarta } from './fonts';
import './globals.css';

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
          <IntlProvider messages={enMessages}>
            <ThemeProvider>{children}</ThemeProvider>
          </IntlProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### src/features/\_examples/i18n/demo.tsx (optional)

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function I18nDemo() {
  const t = useTranslations('common');
  return <div className="text-sm text-fgMuted">Brand: {t('brand')}</div>;
}
```

## Acceptance

- App renders with IntlProvider and default en messages.
- useTranslations('landing') returns strings on pages/components.
- Adding new locales later requires only messages and light routing changes.
