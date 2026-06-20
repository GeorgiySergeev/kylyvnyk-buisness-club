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
      className="relative -mx-4 overflow-hidden px-4 py-[30px] md:-mx-12 md:px-12 mb-0"
      style={{ paddingBlock: '30px' }}
    >
      <div className=" pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-6 space-y-4 text-center">
          <span className="block text-[11px] font-normal uppercase tracking-[0.2em] text-ds-text-faint sm:text-ds-text-xs">
            {eyebrow}
          </span>
          <h2
            id="find-partner-title"
            className="font-sans text-3xl font-bold tracking-tight text-ds-text sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            {title}
          </h2>
          <p className="mx-auto max-w-2xl text-ds-text-sm leading-relaxed text-ds-text-muted sm:text-ds-text-base">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 border-y border-ds-border md:grid-cols-4">
          {filters.map((filter, index) => {
            const Icon = FILTER_ICONS[index];
            const isLastFilter = index === filters.length - 1;

            return (
              <div
                key={filter.label}
                className={`relative ${
                  index > 0
                    ? 'border-t border-ds-border md:border-t-0 md:border-l md:border-ds-border'
                    : ''
                }`}
              >
                <button
                  type="button"
                  className="flex min-h-18 w-full items-center gap-ds-space-3 px-ds-space-6 py-ds-space-5 text-left transition-ds-transition-fast hover:bg-ds-surface-hover focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none sm:px-ds-space-8 sm:py-ds-space-6 md:min-h-20 md:px-ds-space-6"
                  aria-label={filter.label}
                >
                  {Icon ? (
                    <Icon
                      className="size-4 shrink-0 text-ds-text-faint"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="flex-1 truncate text-ds-text-sm text-ds-text-muted sm:text-[15px]">
                    {filter.label}
                  </span>
                  <ChevronDown
                    className="size-4 shrink-0 text-ds-text-faint"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                </button>

                {!isLastFilter ? (
                  <div
                    className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 text-ds-text-muted md:flex"
                    aria-hidden="true"
                  >
                    <ArrowRight className="size-4" strokeWidth={1.25} />
                  </div>
                ) : null}
              </div>
            );
          })}

          <div className="relative border-t border-ds-border md:border-t-0 md:border-l md:border-ds-border">
            <Link
              href={directoryHref}
              className="flex min-h-18 w-full items-center justify-center gap-2.5 px-ds-space-6 py-ds-space-5 text-ds-text-sm font-semibold text-ds-text transition-ds-transition-fast hover:bg-ds-surface-hover focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none sm:px-ds-space-8 sm:py-ds-space-6 md:min-h-20"
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
