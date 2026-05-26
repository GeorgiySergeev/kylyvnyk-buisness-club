import { ArrowRight, Dumbbell, Lock, Plane, Stethoscope } from 'lucide-react';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

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
      {/* Section header */}
      <div className="mb-5 flex items-center justify-between md:mb-6">
        <div className="flex items-center gap-3">
          <div className="h-px w-8 bg-primary" aria-hidden="true" />
          <h2 className="text-xs font-medium uppercase tracking-[5px] text-fg md:text-sm">{title}</h2>
        </div>
        <Link
          href={localizeHref(locale, '/directory')}
          className="flex min-h-10 items-center gap-1 text-xs text-primary transition-colors hover:text-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:text-sm"
        >
          {showMoreCta}
          <ArrowRight className="size-3 md:size-4" aria-hidden="true" />
        </Link>
      </div>

      {/* 2-column grid (not 3) */}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4" role="list">
        {partners.map((partner, index) => {
          const Icon = RECOMMENDED_ICONS[index];
          return (
            <li key={partner.name}>
              <div
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-primary/20 bg-[#16161a] transition-shadow duration-300 hover:border-primary/40 hover:shadow-[0_0_16px_rgba(255,215,0,0.1)]"
                style={{ borderLeft: '3px solid rgba(212,175,55,0.6)' }}
              >
                {/* Subtle corner glow */}
                <div
                  className="pointer-events-none absolute right-0 top-0 h-24 w-24 opacity-20"
                  style={{
                    background:
                      'radial-gradient(circle at top right, rgba(212,175,55,0.25), transparent 70%)',
                  }}
                  aria-hidden="true"
                />

                <div className="relative p-4 md:p-5">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <Icon className="size-5 text-primary" aria-hidden="true" />
                    </div>

                    {/* Name + meta */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <h3 className="font-display text-base font-semibold leading-tight text-fg">
                        {partner.name}
                      </h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {partner.meta}
                      </p>
                    </div>
                  </div>

                  {/* Lock condition badge */}
                  <div className="mt-4 flex items-center gap-1.5 rounded-lg border border-primary/15 bg-[#0a0a0b] px-3 py-2 text-xs text-muted-foreground">
                    <Lock className="size-3 shrink-0 text-primary/60" aria-hidden="true" />
                    <span>{condition}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
