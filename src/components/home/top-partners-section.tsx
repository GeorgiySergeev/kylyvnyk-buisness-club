import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
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
    <section className="relative -mx-4 overflow-hidden border-t border-border/50  px-4 py-16 md:-mx-12 md:px-12 md:py-20">
      <div
        className="pointer-events-none absolute right-1/4 top-0 size-80 rounded-full bg-primary/5 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="sr-only">{recommendedLabel}</span>
            <span className="block text-[10px] font-mono font-semibold uppercase tracking-[0.32em] text-primary">
              {topPartnerLabel}
            </span>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
          </div>

          <div className="flex shrink-0 items-center gap-4 select-none" aria-hidden="true">
            <span className="font-mono text-xs text-muted-foreground">
              01 <span className="text-border">/</span>{' '}
              {String(Math.max(1, renderedCount)).padStart(2, '0')}
            </span>

            <div className="flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground">
                <ChevronLeft className="size-5" />
              </span>
              <span className="flex size-10 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground">
                <ChevronRight className="size-5" />
              </span>
            </div>
          </div>
        </div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:hidden">
          {partnerCards.map((partner) => (
            <div key={partner.name} className="w-[20rem] shrink-0">
              <PremiumPartnerCard labels={cardLabels} partner={partner} />
            </div>
          ))}
        </div>

        {partnerCards.length > 0 ? (
          <div className="hidden gap-6 md:grid md:grid-cols-3">
            {partnerCards.map((partner) => (
              <PremiumPartnerCard key={partner.name} labels={cardLabels} partner={partner} />
            ))}
          </div>
        ) : null}

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
