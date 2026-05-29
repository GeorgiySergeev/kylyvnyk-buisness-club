import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

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
    <article className="group relative flex h-full flex-col overflow-hidden bg-transparent text-card-foreground">
      <div className="relative h-44 shrink-0 overflow-hidden border border-border/50 bg-black">
        {/* Partner images may come from arbitrary approved records, so keep this as a plain img. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
          src={imageSrc}
        />

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {partner.isTopPartner ? (
            <span className="inline-flex min-h-7 items-center border border-border/50 bg-black/70 px-2 text-[10px] uppercase tracking-[0.14em] text-fg/45 backdrop-blur-sm">
              {labels.verifiedLabel}
            </span>
          ) : null}
          {partner.isRecommended ? (
            <span className="inline-flex min-h-7 items-center border border-border/50 bg-black/70 px-2 text-[10px] uppercase tracking-[0.14em] text-fg/45 backdrop-blur-sm">
              {labels.verifiedLabel}
            </span>
          ) : null}
        </div>

        {partner.countryCode ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 border border-border/50 bg-black/70 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-fg/60 backdrop-blur-sm">
            {partner.flagSvg ? (
              <span
                aria-hidden="true"
                className={cn(
                  'inline-flex h-3 w-[1.125rem] shrink-0 overflow-hidden rounded-sm [&_svg]:size-full',
                )}
                dangerouslySetInnerHTML={{ __html: partner.flagSvg }}
              />
            ) : null}
            {partner.countryCode}
          </span>
        ) : null}
        <span className="absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] border border-border/50 bg-black/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-fg/50 backdrop-blur-sm">
          {partner.category}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-start pt-5">
        <div className="min-h-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-fg/45">
            <MapPin aria-hidden="true" className="size-3.5 text-fg/35" strokeWidth={1.5} />
            <span className="truncate">{partner.location}</span>
          </div>

          <h3 className="mt-2 min-w-0 text-lg font-semibold leading-tight text-white transition-colors group-hover:text-white/80">
            {partner.name}
          </h3>

          {partner.description ? (
            <p className="mt-3 h-18 overflow-hidden text-sm leading-6 text-fg/50 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
              {partner.description}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex shrink-0 items-center justify-between gap-4 border-t border-border/50 pt-4">
          {partner.discount ? (
            <span className="text-lg font-semibold tracking-tight text-white">{partner.discount}</span>
          ) : null}
          <Link
            className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
