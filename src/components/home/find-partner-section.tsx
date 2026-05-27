// src/components/home/find-partner-section.tsx
import { ChevronDown, Globe, LayoutGrid, MapPin, Search } from 'lucide-react';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

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
    <section className="py-6 z-10 relative">
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-[#16161a]/60">
        {/* Subtle top primary highlight bar */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent z-10" />

        {/* Soft backglow */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 80% at 50% -10%, rgba(212,175,55,0.06), transparent 60%)',
          }}
          aria-hidden="true"
        />

        <div className="relative p-6 sm:p-8 md:p-10 z-10">
          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <span className="text-[9px] font-semibold tracking-[4px] text-primary uppercase block">
              DIRECTORY SEARCH
            </span>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-widest text-white uppercase">
              {title}
            </h2>
            <div className="h-px w-12 bg-primary/30 mx-auto mt-3" />
          </div>

          {/* Filter row + CTA */}
          <div className="flex flex-col gap-3 xs:grid xs:grid-cols-2 md:grid-cols-4 xs:gap-3 md:gap-4 max-w-4xl mx-auto">
            {filters.map((filter, index) => {
              const Icon = FILTER_ICONS[index];
              return (
                <div
                  key={filter.label}
                  className="flex h-12 cursor-pointer items-center gap-3 rounded-lg border border-primary/15 bg-[#0a0a0b]/60 px-4 text-xs text-fg/70 transition-all duration-300 hover:border-primary/45 hover:bg-[#0a0a0b]/80 focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/20"
                >
                  <Icon className="size-4 shrink-0 text-primary opacity-80" aria-hidden="true" />
                  <span className="flex-1 truncate font-medium tracking-wide">{filter.label}</span>
                  <ChevronDown className="size-3.5 shrink-0 text-fg/40" aria-hidden="true" />
                </div>
              );
            })}

            {/* CTA search button */}
            <Link
              href={localizeHref(locale, '/directory')}
              className="flex h-12 items-center justify-center gap-2.5 rounded-lg bg-accent-foreground hover:bg-accent-hover px-6 text-xs font-bold tracking-[2px] text-primary-foreground uppercase transition-all duration-300 hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring cursor-pointer"
            >
              <Search className="size-4" aria-hidden="true" />
              {searchCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
