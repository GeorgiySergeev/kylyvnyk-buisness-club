// src/components/home/top-partners-section.tsx
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { TopPartnersSlider } from '@/components/home/top-partners-slider';
import { type SupportedLocale, localizeHref } from '@/components/layout/navigation';
import type { PremiumPartnerCardViewModel } from '@/components/partners/premium-partner-card';
import { resolveCountryFlagSvg } from '@/lib/flags/resolve-country-flag-svg';

export interface PartnerData {
  category: string;
  condition: string;
  description: string;
  discount: string;
  flag: string;
  flagLabel: string;
  href?: string;
  img: string;
  location: string;
  name: string;
}

interface TopPartnersSectionProps {
  conditionLabel: string;
  detailsCta: string;
  eyebrow: string;
  locale: SupportedLocale;
  nextLabel: string;
  partners: PartnerData[];
  previousLabel: string;
  regionLabel: string;
  subtitle: string;
  title: string;
  verifiedLabel: string;
  viewAll: string;
}

export async function TopPartnersSection({
  conditionLabel,
  detailsCta,
  eyebrow,
  locale,
  nextLabel,
  partners,
  previousLabel,
  regionLabel,
  subtitle,
  title,
  verifiedLabel,
  viewAll,
}: TopPartnersSectionProps) {
  const cardLabels = {
    conditionLabel,
    detailsLabel: detailsCta,
    verifiedLabel,
  };

  const partnerCards: PremiumPartnerCardViewModel[] = await Promise.all(
    partners.map(async (partner, index) => ({
      category: partner.category,
      condition: partner.condition,
      countryCode: partner.flagLabel,
      discount: partner.discount,
      description: partner.description,
      flagSvg: await resolveCountryFlagSvg(partner.flagLabel),
      href: partner.href ?? localizeHref(locale, '/directory'),
      imageUrl: partner.img,
      isRecommended: index > 0,
      isTopPartner: index === 0,
      location: partner.location,
      name: partner.name,
    })),
  );
  return (
    <section
      aria-labelledby="top-partners-title"
      className="relative -mx-4 overflow-hidden px-4 py-16 xs:py-20 sm:py-24 md:-mx-12 md:px-12 md:py-28 mb-0 "
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl">
        <div className="relative mb-12 space-y-4 text-center sm:mb-16 md:mb-20">
          <span className="block text-[11px] font-normal uppercase tracking-[0.2em] text-fg/45 sm:text-xs">
            {eyebrow}
          </span>
          <h2
            id="top-partners-title"
            className="font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            {title}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-fg/50 sm:text-base">
            {subtitle}
          </p>
        </div>

        {partnerCards.length > 0 ? (
          <TopPartnersSlider
            labels={cardLabels}
            nextLabel={nextLabel}
            partners={partnerCards}
            previousLabel={previousLabel}
            regionLabel={regionLabel}
          />
        ) : null}

        <div className="mt-10 flex justify-center border-t border-border/50 pt-10 sm:mt-12 sm:pt-12">
          <Link
            href={localizeHref(locale, '/directory')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {viewAll}
            <ArrowRight className="size-4" strokeWidth={1.25} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
