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
    <section>
      <div
        className="relative overflow-hidden rounded-xl border border-primary/20 bg-[#1a1a1a]"
        style={{ borderTop: '2px solid rgba(255,215,0,0.5)' }}
      >
        {/* Subtle background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 80% at 50% -10%, rgba(255,215,0,0.06), transparent 60%)',
          }}
          aria-hidden="true"
        />

        <div className="relative p-6 md:p-8">
          {/* Header */}
          <div className="mb-5 flex items-center gap-3 md:mb-6">
            <div className="h-px w-8 bg-primary" aria-hidden="true" />
            <h2 className="text-xs font-medium uppercase tracking-[5px] text-fg md:text-sm">
              {title}
            </h2>
          </div>

          {/* Filter row + CTA */}
          <div className="flex flex-col gap-2 md:grid md:grid-cols-4 md:gap-3">
            {filters.map((filter, index) => {
              const Icon = FILTER_ICONS[index];
              return (
                <div
                  key={filter.label}
                  className="flex h-11 cursor-default items-center gap-2 rounded-lg border border-border/60 bg-[#0a0a0b] px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30"
                >
                  <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                  <span className="flex-1 truncate text-xs">{filter.label}</span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />
                </div>
              );
            })}

            {/* CTA button */}
            <Link
              href={localizeHref(locale, '/directory')}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FFD700] px-5 text-sm font-semibold text-black transition-colors hover:bg-[#C9A84C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
