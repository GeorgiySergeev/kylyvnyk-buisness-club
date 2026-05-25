import { ArrowRight, Bookmark, Dumbbell, Lock, Plane, Stethoscope } from 'lucide-react';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const RECOMMENDED_ICONS = [Stethoscope, Dumbbell, Plane] as const;

export interface RecommendedPartnerData {
  name: string;
  meta: string;
}

interface RecommendedSectionProps {
  locale: SupportedLocale;
  title: string;
  showMoreCta: string;
  condition: string;
  partners: RecommendedPartnerData[];
}

export function RecommendedSection({
  locale,
  title,
  showMoreCta,
  condition,
  partners,
}: RecommendedSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between md:mb-6">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="h-px w-6 bg-primary md:w-8" />
          <h2 className="text-xs tracking-[4.8px] text-fg uppercase md:text-xl">{title}</h2>
        </div>
        <Button asChild variant="ghost" className="gap-1 text-xs text-primary md:text-sm">
          <Link href={localizeHref(locale, '/directory')}>
            {showMoreCta}
            <ArrowRight className="size-3 md:size-4" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {partners.map((partner, index) => {
          const Icon = RECOMMENDED_ICONS[index];
          return (
            <Card key={partner.name} className="border-primary/30 bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-card">
                  <Icon className="size-5 text-primary" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-base leading-6 text-fg">{partner.name}</h3>
                  <p className="text-xs leading-4 text-muted-foreground">{partner.meta}</p>
                </div>
                <Bookmark className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 text-xs leading-4 text-muted-foreground">
                <Lock className="size-3" aria-hidden="true" />
                {condition}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="hidden gap-6 md:grid md:grid-cols-3">
        {partners.map((partner, index) => {
          const Icon = RECOMMENDED_ICONS[index];
          return (
            <Card key={partner.name} className="border-primary/30 bg-card p-6">
              <CardHeader className="flex flex-row items-start justify-between p-0">
                <div className="flex size-12 items-center justify-center rounded-xl bg-card">
                  <Icon className="size-6 text-primary" aria-hidden="true" />
                </div>
                <Bookmark className="size-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent className="mt-4 p-0">
                <h3 className="font-display text-lg leading-7 text-fg">{partner.name}</h3>
                <p className="text-xs leading-4 text-muted-foreground">{partner.meta}</p>
                <div className="mt-4 flex items-center gap-2 border-t border-border pt-4 text-xs leading-4 text-muted-foreground">
                  <Lock className="size-3 text-primary" aria-hidden="true" />
                  {condition}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
