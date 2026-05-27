import { ArrowRight, MapPin } from 'lucide-react';
import Link from 'next/link';

import { CountryFlag } from '@/components/ui/country-flag';

export interface PremiumPartnerCardViewModel {
  category: string;
  condition: string;
  countryCode?: string;
  discount?: string | null;
  description?: string | null;
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
    <article className="group relative flex h-full  overflow-hidden rounded-lg border border-border/80 bg-background text-card-foreground shadow-2xl shadow-black/35 transition-all duration-300 hover:border-primary/45 ">
      <div className="absolute inset-0  from-primary/5 via-transparent to-black/50 opacity-80" />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="relative h-44 shrink-0 overflow-hidden bg-black">
          {/* Partner images may come from arbitrary approved records, so keep this as a plain img. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
            src={imageSrc}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {partner.isTopPartner ? (
              <span className="font-mono inline-flex min-h-7 items-center rounded-sm border border-border/80 bg-background/90 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur">
                {labels.verifiedLabel}
              </span>
            ) : null}
            {partner.isRecommended ? (
              <span className="inline-flex min-h-7 items-center rounded-sm border border-border/80 bg-background/90 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur">
                {labels.verifiedLabel}
              </span>
            ) : null}
          </div>

          {partner.countryCode ? (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-sm border border-border/80 bg-background/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground shadow-sm backdrop-blur">
              <CountryFlag iso2={partner.countryCode} />
              {partner.countryCode}
            </span>
          ) : null}

          <span className="absolute bottom-3 left-3 font-mono text-[10px] max-w-[calc(100%-1.5rem)] rounded-sm bg-primary px-2 py-0.5  font-bold uppercase tracking-wider text-primary-foreground shadow-md">
            {partner.category}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-start p-5">
          <div className="min-h-0">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 text-primary" />
              <span className="truncate font-thin text-gray-400">{partner.location}</span>
            </div>

            <h3 className="mt-2 min-w-0 text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
              {partner.name}
            </h3>

            {partner.description ? (
              <p className="mt-3 h-18 overflow-hidden text-[0.8125rem] leading-6 text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
                {partner.description}
              </p>
            ) : null}
          </div>

          {/* <div className="mt-4 shrink-0 rounded border border-primary/20 bg-primary/8 p-3">
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              {labels.conditionLabel}
            </span>
            <span className="mt-1  max-h-10 overflow-hidden text-xs font-bold leading-5 text-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
              {partner.condition}
            </span>
          </div> */}

          <div className="mt-4 flex shrink-0 items-center justify-between gap-4 border-t border-border/60 pt-4">
            {partner.discount ? (
              <span className=" text-lg font-bold tracking-tight text-primary">
                {partner.discount}
              </span>
            ) : null}
            <Link
              className="ml-auto inline-flex min-h-10 shrink-0 items-center gap-1.5 border-b border-primary pb-0.5 text-xs font-bold uppercase tracking-[0.14em] text-primary transition-colors hover:border-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              href={partner.href}
            >
              {labels.detailsLabel}
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
