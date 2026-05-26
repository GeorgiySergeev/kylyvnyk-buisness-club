import { ArrowRight, BadgeCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';

export interface PartnerData {
  name: string;
  category: string;
  location: string;
  discount: string;
  flag: string;
  flagLabel: string;
  img: string;
}

interface TopPartnersSectionProps {
  locale: SupportedLocale;
  title: string;
  viewAll: string;
  detailsCta: string;
  partners: PartnerData[];
}

interface PartnerCardProps {
  partner: PartnerData;
  locale: SupportedLocale;
  detailsCta: string;
  featured?: boolean;
}

function PartnerCard({ partner, locale, detailsCta, featured = false }: PartnerCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-primary/25 bg-[#16161a] transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(255,215,0,0.14)]"
    >
      {/* Image */}
      <div className={featured ? 'relative h-48 md:h-56' : 'relative h-32'}>
        <Image
          src={partner.img}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={featured ? '(max-width: 768px) 100vw, 60vw' : '(max-width: 768px) 100vw, 40vw'}
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#16161a] via-[#16161a]/40 to-transparent" />

        {/* Flag badge */}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md border border-border/60 bg-[#16161a]/85 px-2 py-1 text-[10px] text-fg/80 backdrop-blur-sm">
          <span>{partner.flag}</span>
          <span className="font-medium tracking-wide">{partner.flagLabel}</span>
        </div>

        {/* Discount badge */}
        <div className="absolute bottom-3 right-3 rounded-md bg-[#FFD700] px-2.5 py-1 text-xs font-bold text-black">
          {partner.discount}
        </div>
      </div>

      {/* Content */}
      <div className={featured ? 'p-5' : 'p-4'}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3
              className={
                featured
                  ? 'font-display text-lg font-semibold leading-tight text-fg'
                  : 'font-display text-base font-semibold leading-tight text-fg'
              }
            >
              {partner.name}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {partner.category}
              <span className="mx-1.5 text-primary/40">·</span>
              {partner.location}
            </p>
          </div>
          <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        </div>

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mt-3 h-8 gap-1.5 px-0 text-xs text-primary hover:bg-transparent hover:text-accent-hover"
        >
          <Link href={localizeHref(locale, '/directory')}>
            {detailsCta}
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function TopPartnersSection({
  locale,
  title,
  viewAll,
  detailsCta,
  partners,
}: TopPartnersSectionProps) {
  const [featured, ...rest] = partners;

  return (
    <section>
      {/* Section header */}
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

      {/* Mobile: horizontal scroll */}
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:hidden">
        {partners.map((partner) => (
          <div key={partner.name} className="w-[260px] shrink-0">
            <PartnerCard partner={partner} locale={locale} detailsCta={detailsCta} />
          </div>
        ))}
      </div>

      {/* Desktop: asymmetric grid — 1 featured (3fr) + 2 stacked (2fr) */}
      {featured && (
        <div className="hidden gap-4 md:grid md:grid-cols-[3fr_2fr]">
          {/* Featured card */}
          <PartnerCard partner={featured} locale={locale} detailsCta={detailsCta} featured />

          {/* Stacked smaller cards */}
          <div className="flex flex-col gap-4">
            {rest.map((partner) => (
              <PartnerCard key={partner.name} partner={partner} locale={locale} detailsCta={detailsCta} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
