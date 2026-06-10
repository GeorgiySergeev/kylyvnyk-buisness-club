// BLOCK: Premium partner card — partner listing card used in partner sections. Review content for PII before making public.
import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { ResponsiveImage } from '@/components/ui/responsive-image';
import { cn } from '@/lib/utils';
export interface PremiumPartnerCardViewModel {
  category: string;
  condition: string;
  countryCode?: string;
  discount?: string | null;
  description?: string | null;
  flagSvg?: string | null;
  href: string;
  imageUrl?: string | null;
  isRecommended?: boolean;
  isTopPartner?: boolean;
  location: string;
  name: string;
}

interface PremiumPartnerCardLabels {
  conditionLabel: string;
  detailsLabel: string;
  verifiedLabel: string;
}

interface PremiumPartnerCardProps {
  labels: PremiumPartnerCardLabels;
  partner: PremiumPartnerCardViewModel;
}

export function PremiumPartnerCard({ labels, partner }: PremiumPartnerCardProps) {
  const fallbackImageSrc = '/partners/default.svg';
  const imageSrc = partner.imageUrl?.trim() || fallbackImageSrc;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden bg-transparent text-ds-text">
      <div className="relative h-44 shrink-0 overflow-hidden border border-ds-border bg-black">
        <ResponsiveImage
          alt=""
          className="group-hover:scale-105"
          containerClassName="absolute inset-0 size-full"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          src={imageSrc}
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {partner.isTopPartner ? (
            <Badge
              className="border-ds-border bg-black/70 uppercase tracking-[0.14em] text-ds-text-muted backdrop-blur-sm"
              variant="outline"
            >
              {labels.verifiedLabel}
            </Badge>
          ) : null}
          {partner.isRecommended ? (
            <Badge
              className="border-ds-border bg-black/70 uppercase tracking-[0.14em] text-ds-text-muted backdrop-blur-sm"
              variant="outline"
            >
              {labels.verifiedLabel}
            </Badge>
          ) : null}
        </div>

        {partner.countryCode ? (
          <Badge
            className="absolute right-3 top-3 gap-1 border-ds-border bg-black/70 uppercase tracking-[0.14em] text-ds-text-muted backdrop-blur-sm"
            variant="outline"
          >
            {partner.flagSvg ? (
              <span
                aria-hidden="true"
                className={cn(
                  'inline-flex h-2.5 w-3.5 shrink-0 overflow-hidden rounded-none [&_svg]:size-full',
                )}
                dangerouslySetInnerHTML={{ __html: partner.flagSvg }}
              />
            ) : null}
            {partner.countryCode}
          </Badge>
        ) : null}
        <Badge
          className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] border-ds-border bg-black/70 uppercase tracking-[0.14em] text-ds-text-muted backdrop-blur-sm"
          variant="outline"
        >
          {partner.category}
        </Badge>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-start pt-5">
        <div className="min-h-0">
          <div className="flex items-center gap-2 text-ds-text-xs uppercase tracking-[0.14em] text-ds-text-muted">
            <MapPin aria-hidden="true" className="size-3.5 text-ds-text-faint" strokeWidth={1.5} />
            <span className="truncate">{partner.location}</span>
          </div>

          <h3 className="mt-2 min-w-0 text-ds-text-lg font-semibold leading-tight text-ds-text transition-ds-transition-fast group-hover:text-ds-text-muted">
            {partner.name}
          </h3>

          {partner.description ? (
            <p className="mt-3 h-18 overflow-hidden text-ds-text-sm leading-6 text-ds-text-muted [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
              {partner.description}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex shrink-0 items-center justify-between gap-4 border-t border-ds-border pt-4">
          {partner.discount ? (
            <span className="text-ds-text-lg font-semibold tracking-tight text-ds-text">{partner.discount}</span>
          ) : null}
          <Link
            className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-ds-space-2 text-ds-text-sm font-semibold text-ds-text transition-ds-transition-fast hover:text-ds-text-muted focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
            href={partner.href}
          >
            {labels.detailsLabel}
            <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.25} />
          </Link>
        </div>
      </div>
    </article>
  );
}
