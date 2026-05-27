// src/components/home/stats-section.tsx
import { StatsCounter } from '@/components/home/stats-counter';

interface StatsSectionProps {
  stats: Array<{ value: string; label: string }>;
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section aria-label="Platform statistics" className="py-4 sm:py-6 md:py-8 z-10 relative">
      {/* Top luxury gold rule divider */}
      <hr className="kc-gold-rule mb-6 sm:mb-8 md:mb-10 opacity-45" />

      {/* Floating Centered Stats - Stack on mobile, 3 columns on sm+ */}
      <div className="grid grid-cols-1 xs:grid-cols-3 gap-6 xs:gap-4 sm:gap-4 max-w-5xl mx-auto">
        {stats.map((stat) => {
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center px-1 sm:px-4"
            >
              {/* Massive floating gold number with mobile-first sizes */}
              <StatsCounter
                value={stat.value}
                className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-none mb-2 sm:mb-3"
              />

              {/* Muted luxury label with mobile-first sizes */}
              <span className="text-[7.5px] sm:text-[9px] md:text-[10px] font-semibold uppercase tracking-[2px] sm:tracking-[4px] md:tracking-[5px] text-fg/50 leading-snug">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom luxury gold rule divider */}
      <hr className="kc-gold-rule mt-6 sm:mb-8 md:mt-10 opacity-45" />
    </section>
  );
}
