import { ArrowRight, BadgeCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

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

export function TopPartnersSection({
  locale,
  title,
  viewAll,
  detailsCta,
  partners,
}: TopPartnersSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="h-px w-6 bg-primary md:w-8" />
          <h2 className="text-xs tracking-[4.8px] text-fg uppercase md:text-xl">{title}</h2>
        </div>
        <Link
          href={localizeHref(locale, '/directory')}
          className="flex min-h-11 items-center gap-1 text-xs text-primary transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:text-sm"
        >
          {viewAll}
          <ArrowRight className="size-3 md:size-4" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 md:hidden -mx-6 px-6">
        {partners.map((partner) => (
          <Card
            key={partner.name}
            className="min-w-[260px] shrink-0 border-primary/30 bg-card overflow-hidden p-0"
          >
            <div className="relative h-32">
              <Image
                src={partner.img}
                alt=""
                fill
                className="object-cover"
                sizes="260px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
              <Badge className="absolute left-2 top-2 bg-card/80 text-[10px] text-fg">
                {partner.flag} {partner.flagLabel}
              </Badge>
              <Badge className="absolute bottom-2 right-2 bg-primary text-[10px] text-primary-foreground font-semibold">
                {partner.discount}
              </Badge>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base leading-6 text-fg">{partner.name}</h3>
                <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
              </div>
              <p className="text-xs leading-4 text-muted-foreground">
                {partner.category} · {partner.location}
              </p>
              <Button asChild variant="ghost" size="sm" className="mt-2 h-8 justify-between px-0 text-primary">
                <Link href={localizeHref(locale, '/directory')}>
                  {detailsCta}
                  <ArrowRight className="size-3" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="hidden gap-6 md:grid md:grid-cols-3">
        {partners.map((partner) => (
          <Card
            key={partner.name}
            className="border-primary/30 bg-card overflow-hidden p-0"
          >
            <div className="relative h-32">
              <Image
                src={partner.img}
                alt=""
                fill
                className="object-cover"
                sizes="33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
              <Badge className="absolute left-3 top-3 bg-card/80 text-xs text-fg">
                {partner.flag}
              </Badge>
              <Badge className="absolute bottom-3 right-3 bg-primary text-sm text-primary-foreground font-semibold">
                {partner.discount}
              </Badge>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg leading-7 text-fg">{partner.name}</h3>
                <BadgeCheck className="size-4 text-primary" aria-hidden="true" />
              </div>
              <p className="text-xs leading-4 text-muted-foreground">
                {partner.category} · {partner.location}
              </p>
              <Button asChild variant="outline" size="sm" className="mt-4 border-primary/50 text-primary">
                <Link href={localizeHref(locale, '/directory')}>
                  {detailsCta}
                  <ArrowRight className="size-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
