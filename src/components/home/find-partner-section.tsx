import { ChevronDown, Globe, LayoutGrid, MapPin, Search } from 'lucide-react';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface FilterData {
  label: string;
}

interface FindPartnerSectionProps {
  locale: SupportedLocale;
  title: string;
  searchCta: string;
  filters: FilterData[];
}

const FILTER_ICONS = [Globe, MapPin, LayoutGrid] as const;

export function FindPartnerSection({ locale, title, searchCta, filters }: FindPartnerSectionProps) {
  return (
    <section>
      <Card className="border-primary/30 bg-card p-6 md:p-8">
        <CardHeader className="flex flex-row items-center gap-2 p-0 md:gap-4">
          <div className="h-px w-6 bg-primary md:w-8" />
          <h2 className="text-xs tracking-[4.8px] text-fg uppercase md:text-xl">{title}</h2>
        </CardHeader>
        <CardContent className="mt-4 flex flex-col gap-2 p-0 md:mt-6 md:grid md:grid-cols-4 md:gap-4">
          {filters.map((filter, index) => {
            const Icon = FILTER_ICONS[index];
            return (
              <div
                key={filter.label}
                className="flex h-11 items-center gap-2 rounded-lg border border-border bg-bg px-3 text-sm text-muted-foreground"
              >
                <Icon className="size-4 text-primary" aria-hidden="true" />
                <span className="flex-1 text-xs leading-4">{filter.label}</span>
                <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
            );
          })}
          <Button asChild className="h-11 gap-2 bg-primary text-primary-foreground md:h-11">
            <Link href={localizeHref(locale, '/directory')}>
              <Search className="size-4" aria-hidden="true" />
              {searchCta}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
