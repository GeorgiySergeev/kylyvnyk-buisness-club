// src/components/home/stats-section.tsx
import { StatsCounter } from '@/components/home/stats-counter';

interface StatsSectionProps {
  eyebrow: string;
  stats: Array<{ label: string; value: string }>;
  subtitle: string;
  title: string;
}

export function StatsSection({ eyebrow, stats, subtitle, title }: StatsSectionProps) {
  return (
    <section
      aria-labelledby="stats-title"
      className="relative -mx-4 overflow-hidden px-4 py-16 xs:py-20 sm:py-24 md:-mx-12 md:px-12 md:py-28 mb-0 "
    >
      <div className=" pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-12 space-y-4 text-center sm:mb-16 md:mb-20">
          <span className="block text-[11px] font-normal uppercase tracking-[0.2em] text-ds-text-faint sm:text-ds-text-xs">
            {eyebrow}
          </span>
          <h2
            id="stats-title"
            className="font-sans text-3xl font-bold tracking-tight text-ds-text sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            {title}
          </h2>
          <p className="mx-auto max-w-2xl text-ds-text-sm leading-relaxed text-ds-text-muted sm:text-ds-text-base">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 border-y border-ds-border xs:grid-cols-3">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center justify-center px-6 py-8 text-center sm:px-8 sm:py-10 md:px-10 md:py-12 ${
                index > 0
                  ? 'border-t border-ds-border xs:border-t-0 xs:border-l xs:border-ds-border'
                  : ''
              }`}
            >
              <StatsCounter
                value={stat.value}
                className="mb-2 font-sans text-3xl font-bold leading-none tracking-tight text-ds-text sm:mb-3 sm:text-4xl md:text-5xl"
              />
              <span className="text-ds-text-sm text-ds-text-muted sm:text-[15px]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
