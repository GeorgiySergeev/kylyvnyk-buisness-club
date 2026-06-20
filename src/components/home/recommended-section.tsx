// src/components/home/recommended-section.tsx
// BLOCK: Recommended partners section — renders recommended partner cards on the home page.
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import {
  PremiumPartnerCard,
  type PremiumPartnerCardViewModel,
} from '@/components/partners/premium-partner-card';
import { resolveCountryFlagSvg } from '@/lib/flags/resolve-country-flag-svg';

export interface RecommendedPartnerData {
  category: string;
  description?: string;
  flagLabel?: string;
  img?: string;
  location: string;
  name: string;
}

interface RecommendedSectionProps {
  condition: string;
  detailsCta: string;
  eyebrow: string;
  locale: SupportedLocale;
  partners: RecommendedPartnerData[];
  subtitle: string;
  title: string;
  verifiedLabel: string;
  viewAll: string;
}

export async function RecommendedSection({
  condition,
  detailsCta,
  eyebrow,
  locale,
  partners,
  subtitle,
  title,
  verifiedLabel,
  viewAll,
}: RecommendedSectionProps) {
  const cardLabels = {
    conditionLabel: condition,
    detailsLabel: detailsCta,
    verifiedLabel,
  };

  const partnerCards: PremiumPartnerCardViewModel[] = await Promise.all(
    partners.map(async (partner) => ({
      category: partner.category,
      condition,
      countryCode: partner.flagLabel,
      description: partner.description,
      discount: null,
      flagSvg: await resolveCountryFlagSvg(partner.flagLabel),
      href: localizeHref(locale, '/directory'),
      imageUrl: partner.img,
      isRecommended: true,
      location: partner.location,
      name: partner.name,
    })),
  );

  return (
    <section
      aria-labelledby="recommended-partners-title"
      className="relative -mx-4 overflow-hidden px-4 py-[30px] md:-mx-12 md:px-12 mb-0"
      style={{ paddingBlock: '30px' }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-6 space-y-4 text-center">
          <span className="block text-[11px] font-normal uppercase tracking-[0.2em] text-ds-text-faint sm:text-ds-text-xs">
            {eyebrow}
          </span>
          <h2
            id="recommended-partners-title"
            className="font-sans text-3xl font-bold tracking-tight text-ds-text sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            {title}
          </h2>
          <p className="mx-auto max-w-2xl text-ds-text-sm leading-relaxed text-ds-text-muted sm:text-ds-text-base">
            {subtitle}
          </p>
        </div>

        {partnerCards.length > 0 ? (
          <div className="grid grid-cols-1 border-y border-ds-border md:grid-cols-3">
            {partnerCards.map((partner, index) => {
              const isLast = index === partnerCards.length - 1;

              return (
                <div
                  key={partner.name}
                  className={`relative ${
                    index > 0
                      ? 'border-t border-ds-border md:border-t-0 md:border-l md:border-ds-border'
                      : ''
                  }`}
                >
                  <div className="p-4 sm:p-5 md:p-6">
                    <PremiumPartnerCard labels={cardLabels} partner={partner} />
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
        ) : null}

        <div className="mt-5 flex justify-center border-t border-ds-border pt-5">
          <Link
            href={localizeHref(locale, '/directory')}
            className="inline-flex items-center gap-ds-space-2 text-ds-text-sm font-semibold text-ds-text transition-ds-transition-fast hover:text-ds-text-muted focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
          >
            {viewAll}
            <ArrowRight className="size-4" strokeWidth={1.25} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
