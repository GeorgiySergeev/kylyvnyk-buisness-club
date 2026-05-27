// src/components/home/top-partners-section.tsx
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import {
  PremiumPartnerCard,
  type PremiumPartnerCardViewModel,
} from '@/components/partners/premium-partner-card';

export interface PartnerData {
  category: string;
  condition: string;
  description: string;
  discount: string;
  flag: string;
  flagLabel: string;
  img: string;
  location: string;
  name: string;
}

interface TopPartnersSectionProps {
  conditionLabel: string;
  detailsCta: string;
  locale: SupportedLocale;
  partners: PartnerData[];
  recommendedLabel: string;
  subtitle: string;
  title: string;
  topPartnerLabel: string;
  verifiedLabel: string;
  viewAll: string;
}

export function TopPartnersSection({
  conditionLabel,
  detailsCta,
  locale,
  partners,
  recommendedLabel,
  subtitle,
  title,
  topPartnerLabel,
  verifiedLabel,
  viewAll,
}: TopPartnersSectionProps) {
  const cardLabels = {
    conditionLabel,
    detailsLabel: detailsCta,
    verifiedLabel,
  };

  const partnerCards: PremiumPartnerCardViewModel[] = partners.map((partner, index) => ({
    category: partner.category,
    condition: partner.condition,
    countryCode: partner.flagLabel,
    discount: partner.discount,
    description: partner.description,
    href: localizeHref(locale, '/directory'),
    imageUrl: partner.img,
    isRecommended: index > 0,
    isTopPartner: index === 0,
    location: partner.location,
    name: partner.name,
  }));

  const renderedCount = Math.min(3, partnerCards.length);

  return (
    <section className="relative -mx-4 overflow-hidden border-t border-border/50 px-4 py-10 xs:py-12 sm:py-16 md:-mx-12 md:px-12 md:py-20">
      {/* Soft atmospheric background glow */}
      <div
        className="pointer-events-none absolute right-1/4 top-0 size-80 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        {/* Section Header - Mobile-first layout */}
        <div className="mb-8 sm:mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-2">
            <span className="sr-only">{recommendedLabel}</span>
            <span className="block text-[9px] sm:text-[10px] font-mono font-semibold uppercase tracking-[0.32em] text-primary">
              {topPartnerLabel}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight text-foreground">
              {title}
            </h2>
            <p className="max-w-2xl text-xs sm:text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          </div>

          {/* Navigation Indicators */}
          <div className="flex shrink-0 items-center gap-4 select-none" aria-hidden="true">
            <span className="font-mono text-xs text-muted-foreground">
              01 <span className="text-border">/</span>{' '}
              {String(Math.max(1, renderedCount)).padStart(2, '0')}
            </span>

            <div className="flex items-center gap-2">
              <span className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground hover:border-primary/45 transition-colors cursor-pointer">
                <ChevronLeft className="size-4 sm:size-5" />
              </span>
              <span className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground hover:border-primary/45 transition-colors cursor-pointer">
                <ChevronRight className="size-4 sm:size-5" />
              </span>
            </div>
          </div>
        </div>

        {/* 
          Single, Highly-Optimized Mobile-First Card List
          - On mobile: Horizontal slider via horizontal overflow-x-auto & flex scroll snapping
          - On desktop (md+): Instantly transforms into a standard 3-column responsive grid
          No duplicative DOM markup!
        */}
        {partnerCards.length > 0 && (
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
            {partnerCards.map((partner) => (
              <div
                key={partner.name}
                className="w-[calc(100vw-5rem)] xs:w-[16rem] sm:w-[20rem] shrink-0 md:w-auto md:shrink"
              >
                <PremiumPartnerCard labels={cardLabels} partner={partner} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Link
            href={localizeHref(locale, '/directory')}
            className="inline-flex min-h-10 items-center gap-1.5 border-b border-primary pb-0.5 text-xs font-bold uppercase tracking-[0.14em] text-primary transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            {viewAll}
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
