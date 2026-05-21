# 02-localizable-slogans-cta-legal.md

## Title

Localize landing slogans, CTAs, and legal inserts

## Objective

Replace hardcoded strings in LandingHero, header nav, Catalog page, and LegalInserts with next-intl translations.

## Steps

1. Update LandingHero to use t('landing.\*') and common CTA labels.
2. Update SiteHeader to use t('nav.\*').
3. Update Catalog page to use t('catalog.\*').
4. Update LegalInserts to read from legal.footer namespace.

## Files to modify

- src/features/landing/hero.tsx
- src/components/layout/site-header.tsx
- src/app/(public)/catalog/page.tsx
- src/features/legal/footer-inserts.tsx

### src/features/landing/hero.tsx (patch)

```tsx
import { auth } from '@clerk/nextjs/server';
import { getTranslations } from 'next-intl/server';

import { VipCtaButton } from '@/components/common/vip-cta-button';
import { KylyvnykLogo } from '@/components/icons/brand/kylyvnyk-logo';
import { LinkButton } from '@/components/ui/link-button';
import '@/styles/hero.css';

export default async function LandingHero() {
  const { userId } = auth();
  const tLanding = await getTranslations('landing');
  const tCommon = await getTranslations('common');

  return (
    <section className="hero-wrap border-b border-border">
      <div aria-hidden className="hero-bg" />
      <div aria-hidden className="hero-grid" />
      <div className="container relative z-10 py-14 md:py-20">
        <div className="flex items-center gap-3">
          <KylyvnykLogo className="h-10 w-10" />
          <div className="text-lg font-semibold tracking-wide">{tCommon('brand')}</div>
        </div>

        <h1 className="h1 mt-6 max-w-3xl">{tLanding('hero.headline')}</h1>
        <p className="body-lg mt-3 max-w-2xl text-fgMuted">{tLanding('hero.subline')}</p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <LinkButton href={userId ? '/member' : '/sign-up'} variant="gold" className="min-h-11">
            {userId ? 'Go to Member Area' : tCommon('cta.getCardFree')}
          </LinkButton>

          {userId ? (
            <VipCtaButton label={tCommon('cta.becomeVip')} />
          ) : (
            <LinkButton href="/sign-in" className="min-h-11">
              {tCommon('cta.becomeVip')}
            </LinkButton>
          )}

          <LinkButton href={userId ? '/business' : '/sign-up?intent=business'} className="min-h-11">
            {tCommon('cta.submitBusiness')}
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
```

### src/components/layout/site-header.tsx (patch)

```tsx
'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { KylyvnykLogo } from '@/components/icons/brand/kylyvnyk-logo';

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const t = useTranslations('nav');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <KylyvnykLogo className="h-7 w-7" />
          {!compact && <span className="font-semibold tracking-wide">KYLYVNYK CLUB</span>}
        </Link>

        <nav className="hidden sm:flex items-center gap-6 text-sm">
          <Link href="/catalog" className="hover:text-gold-400">
            {t('partners')}
          </Link>
          <Link href="/verify-card" className="hover:text-gold-400">
            {t('verifyCard')}
          </Link>
          <Link href="/sign-in" className="hover:text-gold-400">
            {t('signIn')}
          </Link>
          <Link
            href="/sign-up"
            className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold"
          >
            {t('getCard')}
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
            <Link href="/catalog" onClick={() => setOpen(false)}>
              {t('partners')}
            </Link>
            <Link href="/verify-card" onClick={() => setOpen(false)}>
              {t('verifyCard')}
            </Link>
            <Link href="/sign-in" onClick={() => setOpen(false)}>
              {t('signIn')}
            </Link>
            <Link
              href="/sign-up"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold text-center"
            >
              {t('getCard')}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
```

### src/app/(public)/catalog/page.tsx (patch headings/notes)

```tsx
import { getTranslations } from 'next-intl/server';

import { BusinessCard } from '@/components/cards/business-card';
import { Section } from '@/components/ui/section';
import CatalogFilterBar from '@/features/catalog/filters';
import { parseCatalogQuery } from '@/features/catalog/params';
import { listBusinessesWithFilters } from '@/features/catalog/server/queries';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const t = await getTranslations('catalog');
  const qs = parseCatalogQuery(searchParams);
  const { rows, hasMore } = await listBusinessesWithFilters(qs);

  return (
    <Section>
      <h1 className="h2">{t('title')}</h1>
      <p className="mt-2 body-sm text-fgMuted">{t('note')}</p>

      <CatalogFilterBar searchParams={searchParams} />

      {rows.length === 0 ? (
        <div className="mt-10 rounded-lg border border-border bg-card p-6 text-sm text-fgMuted">
          {t('empty')}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((p) => (
            <BusinessCard
              key={p.id}
              id={p.id}
              name={p.name}
              category={p.category ?? '—'}
              country={p.country ?? '—'}
              city={p.city ?? '—'}
              specialCondition={null}
              revealCondition={false}
            />
          ))}
        </div>
      )}
    </Section>
  );
}
```

### src/features/legal/footer-inserts.tsx (patch to use messages)

```tsx
import { useTranslations } from 'next-intl';

export function LegalInserts({ className }: { className?: string }) {
  const t = useTranslations('legal.footer');
  return (
    <div className={className}>
      <p className="text-sm text-fgMuted">
        {t('platform')} {t('specialConditions')} {t('noGuarantees')} {t('partnerResponsibility')}{' '}
        {t('noParticipation')} {t('notEmployerInvestment')}
      </p>
    </div>
  );
}
```

## Acceptance

- Landing, header, catalog, and footer legal blocks use next-intl.
- No hardcoded English strings in these areas.
- Future locales can override the same keys.
