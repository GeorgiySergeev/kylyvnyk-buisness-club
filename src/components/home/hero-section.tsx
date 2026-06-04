// src/components/home/hero-section.tsx
// BLOCK: Hero section — site top hero with CTAs and tier info. Visible on home page.
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

export interface HeroSectionProps {
  heroEyebrow: string;
  heroSubtitle: string;
  heroSubtitleHighlight: string;
  heroTitle: string;
  isAuthenticated: boolean;
  locale: SupportedLocale;
  memberDashboard: string;
  secondaryCta: string;
  tierApplyCta: string;
  tierMemberDesc: string;
  tierMemberTitle: string;
  tierPartnerDesc: string;
  tierPartnerTitle: string;
  tierPopularBadge: string;
  tierVipDesc: string;
  tierVipTitle: string;
}

export function HeroSection({
  heroEyebrow,
  heroSubtitle,
  heroSubtitleHighlight,
  heroTitle,
  isAuthenticated,
  locale,
  memberDashboard,
  secondaryCta,
  tierApplyCta,
  tierMemberDesc,
  tierMemberTitle,
  tierPartnerDesc,
  tierPartnerTitle,
  tierPopularBadge,
  tierVipDesc,
  tierVipTitle,
}: HeroSectionProps) {
  const targetLink = isAuthenticated
    ? localizeHref(locale, '/m/dashboard')
    : localizeHref(locale, '/sign-up');

  const tiers = [
    { description: tierMemberDesc, title: tierMemberTitle },
    { badge: tierPopularBadge, description: tierVipDesc, title: tierVipTitle },
    { description: tierPartnerDesc, title: tierPartnerTitle },
  ] as const;

  return (
    <section
      aria-labelledby="hero-title"
      className="relative -mx-4 overflow-hidden px-4 pb-16 pt-12 xs:pb-20 xs:pt-16 sm:pb-24 sm:pt-20 md:-mx-12 md:px-12  mb-0 "
    >
      <div className=" pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-12 space-y-4 text-center sm:mb-16 md:mb-20">
          <span className="block text-[11px] font-normal uppercase tracking-[0.2em] text-ds-text-faint sm:text-ds-text-xs">
            {heroEyebrow}
          </span>
          <h1
            id="hero-title"
            className="font-sans text-4xl font-bold tracking-tight text-ds-text sm:text-5xl md:text-[3.25rem] md:leading-tight"
          >
            {heroTitle}
            <span className="mt-2 block text-2xl font-semibold text-ds-text sm:text-3xl md:text-4xl">
              {heroSubtitle}
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-ds-text-sm leading-relaxed text-ds-text-muted sm:text-ds-text-base">
            {heroSubtitleHighlight}
          </p>
        </div>

        <div className="grid grid-cols-1 border-y border-ds-border md:grid-cols-3">
          {tiers.map((tier, index) => {
            const isLast = index === tiers.length - 1;

            return (
              <div
                key={tier.title}
                className={`relative flex flex-col ${
                  index > 0
                    ? 'border-t border-ds-border md:border-t-0 md:border-l md:border-ds-border'
                    : ''
                }`}
              >
                <div className="flex flex-1 flex-col px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
                  <div className="mb-6 space-y-3 md:mb-8 md:pr-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-ds-text-base font-semibold text-ds-text sm:text-ds-text-lg">
                        {tier.title}
                      </h2>
                      {'badge' in tier && tier.badge ? (
                        <span className="shrink-0 border border-ds-border px-1.5 py-px text-[10px] uppercase tracking-[0.14em] text-ds-text-faint">
                          {tier.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="max-w-sm text-ds-text-sm leading-relaxed text-ds-text-muted sm:text-[15px]">
                      {tier.description}
                    </p>
                  </div>

                  <Link
                    href={targetLink}
                    className="mt-auto inline-flex items-center gap-ds-space-2 text-ds-text-sm font-semibold text-ds-text transition-ds-transition-fast hover:text-ds-text-muted focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
                  >
                    {tierApplyCta}
                    <ArrowRight className="size-4" strokeWidth={1.25} aria-hidden="true" />
                  </Link>
                </div>

                {!isLast ? (
                  <div
                    className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 text-ds-text-muted md:flex"
                    aria-hidden="true"
                  >
                    <ArrowRight className="size-4" strokeWidth={1.25} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {isAuthenticated ? (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-ds-border pt-10 sm:mt-12 sm:gap-8 sm:pt-12">
            <Link
              href={localizeHref(locale, '/m/dashboard')}
              className="inline-flex items-center gap-ds-space-2 text-ds-text-sm font-semibold text-ds-text transition-ds-transition-fast hover:text-ds-text-muted focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
            >
              {memberDashboard}
              <ArrowRight className="size-4" strokeWidth={1.25} aria-hidden="true" />
            </Link>
            <Link
              href={localizeHref(locale, '/directory')}
              className="inline-flex items-center gap-ds-space-2 text-ds-text-sm text-ds-text-muted transition-ds-transition-fast hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
            >
              {secondaryCta}
              <ArrowRight className="size-4" strokeWidth={1.25} aria-hidden="true" />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
