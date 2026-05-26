import { Globe2, Handshake, Users } from 'lucide-react';

import { StatsCounter } from '@/components/home/stats-counter';

const STATS_ICONS = [Users, Globe2, Handshake] as const;

interface StatsSectionProps {
  stats: Array<{ value: string; label: string }>;
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section aria-label="Platform statistics">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.map((stat, index) => {
          const Icon = STATS_ICONS[index];
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-xl border border-primary/25 bg-[#16161a] p-4 text-center transition-shadow duration-300 hover:shadow-[0_0_20px_rgba(255,215,0,0.12)] md:p-6"
              style={{ borderTop: '2px solid rgb(212 175 55 / 0.6)' }}
            >
              {/* Subtle corner accent */}
              <div
                className="pointer-events-none absolute right-0 top-0 size-16 opacity-30"
                style={{
                  background:
                    'radial-gradient(circle at top right, rgba(212,175,55,0.18), transparent 70%)',
                }}
                aria-hidden="true"
              />

              <div className="relative flex flex-col items-center gap-2 md:gap-3">
                <div className="flex size-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 transition-colors group-hover:border-primary/70 group-hover:bg-primary/15 md:size-12">
                  <Icon className="size-4 text-primary md:size-5" aria-hidden="true" />
                </div>

                <StatsCounter
                  value={stat.value}
                  className="font-display text-xl font-bold leading-none text-primary md:text-3xl"
                />

                <span className="text-[9px] font-medium uppercase tracking-[4px] text-muted-foreground md:text-[10px]">
                  {stat.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
