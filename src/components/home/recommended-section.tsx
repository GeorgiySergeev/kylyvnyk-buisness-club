import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import {
  PremiumPartnerCard,
  type PremiumPartnerCardViewModel,
} from '@/components/partners/premium-partner-card';

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
  locale: SupportedLocale;
  partners: RecommendedPartnerData[];
  title: string;
  verifiedLabel: string;
  viewAll: string;
}

export function RecommendedSection({
  condition,
  detailsCta,
  locale,
  partners,
  title,
  verifiedLabel,
  viewAll,
}: RecommendedSectionProps) {
  const cardLabels = {
    conditionLabel: condition,
    detailsLabel: detailsCta,
    verifiedLabel,
  };

  const partnerCards: PremiumPartnerCardViewModel[] = partners.map((partner) => ({
    category: partner.category,
    condition,
    countryCode: partner.flagLabel,
    description: partner.description,
    discount: null,
    href: localizeHref(locale, '/directory'),
    imageUrl: partner.img,
    isRecommended: true,
    location: partner.location,
    name: partner.name,
  }));

  return (
    <section>
      <div className="mb-5 flex items-center justify-between md:mb-6">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-primary" aria-hidden="true" />
          <h2 className="text-xs font-medium uppercase tracking-[5px] text-fg md:text-sm">
            {title}
          </h2>
        </div>
        <Link
          href={localizeHref(locale, '/directory')}
          className="flex min-h-10 items-center gap-1 text-xs text-primary transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:text-sm"
        >
          {viewAll}
          <ArrowRight className="size-3 md:size-4" aria-hidden="true" />
        </Link>
      </div>

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
    </section>
  );
}
