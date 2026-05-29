// src/components/home/find-partner-section.tsx
import { ArrowRight, ChevronDown, Globe, LayoutGrid, MapPin, Search } from 'lucide-react';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

interface FilterData {
  label: string;
}

interface FindPartnerSectionProps {
  eyebrow: string;
  filters: FilterData[];
  locale: SupportedLocale;
  searchCta: string;
  subtitle: string;
  title: string;
}

const FILTER_ICONS = [Globe, MapPin, LayoutGrid] as const;

export function FindPartnerSection({
  eyebrow,
  filters,
  locale,
  searchCta,
  subtitle,
  title,
}: FindPartnerSectionProps) {
  const directoryHref = localizeHref(locale, '/directory');

  return (
    <section
      aria-labelledby="find-partner-title"
      className="relative -mx-4 overflow-hidden px-4 py-16 xs:py-20 sm:py-24 md:-mx-12 md:px-12 md:py-28 mb-0 "
    >
      <div className=" pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-12 space-y-4 text-center sm:mb-16 md:mb-20">
          <span className="block text-[11px] font-normal uppercase tracking-[0.2em] text-fg/45 sm:text-xs">
            {eyebrow}
          </span>
          <h2
            id="find-partner-title"
            className="font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            {title}
          </h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-fg/50 sm:text-base">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 border-y border-border/50 md:grid-cols-4">
          {filters.map((filter, index) => {
            const Icon = FILTER_ICONS[index];
            const isLastFilter = index === filters.length - 1;

            return (
              <div
                key={filter.label}
                className={`relative ${
                  index > 0
                    ? 'border-t border-border/50 md:border-t-0 md:border-l md:border-border/50'
                    : ''
                }`}
              >
                <button
                  type="button"
                  className="flex min-h-18 w-full items-center gap-3 px-6 py-5 text-left transition-colors hover:bg-white/2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-8 sm:py-6 md:min-h-20 md:px-6"
                  aria-label={filter.label}
                >
                  {Icon ? (
                    <Icon
                      className="size-4 shrink-0 text-fg/35"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="flex-1 truncate text-sm text-fg/65 sm:text-[15px]">
                    {filter.label}
                  </span>
                  <ChevronDown
                    className="size-4 shrink-0 text-fg/35"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </button>

                {!isLastFilter ? (
                  <div
                    className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 text-white/70 md:flex"
                    aria-hidden="true"
                  >
                    <ArrowRight className="size-4" strokeWidth={1.25} />
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className="relative border-t border-border/50 md:border-t-0 md:border-l md:border-border/50">
            <Link
              href={directoryHref}
              className="flex min-h-18 w-full items-center justify-center gap-2.5 px-6 py-5 text-sm font-semibold text-white transition-colors hover:bg-white/4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-8 sm:py-6 md:min-h-20"
            >
              <Search className="size-4" strokeWidth={1.5} aria-hidden="true" />
              {searchCta}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
