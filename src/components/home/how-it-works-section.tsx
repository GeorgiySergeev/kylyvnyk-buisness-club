import { CreditCard, Percent, Search, UserPlus } from 'lucide-react';

const STEP_ICONS = [UserPlus, CreditCard, Search, Percent] as const;

interface StepData {
  title: string;
  text: string;
}

interface HowItWorksSectionProps {
  title: string;
  steps: StepData[];
}

const FADE_DELAYS = ['kc-fade-in', 'kc-fade-in-delay-1', 'kc-fade-in-delay-2', 'kc-fade-in-delay-3'] as const;

export function HowItWorksSection({ title, steps }: HowItWorksSectionProps) {
  return (
    <section>
      {/* Section header */}
      <div className="mb-6 flex items-center gap-3 md:mb-8">
        <div className="h-px w-8 bg-primary" aria-hidden="true" />
        <h2 className="text-xs font-medium uppercase tracking-[5px] text-fg md:text-sm">{title}</h2>
      </div>

      {/* Timeline wrapper */}
      <div className="relative">
        {/* Connector line — desktop only */}
        <div
          className="absolute left-0 right-0 top-[22px] hidden h-px md:block"
          style={{
            background:
              'linear-gradient(90deg, rgba(212,175,55,0) 0%, rgba(212,175,55,0.5) 15%, rgba(212,175,55,0.5) 85%, rgba(212,175,55,0) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Steps grid */}
        <ol className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6" aria-label="How it works steps">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index];
            const delay = FADE_DELAYS[index] ?? 'kc-fade-in';
            return (
              <li
                key={step.title}
                className={`${delay} group relative flex flex-col gap-4 rounded-xl border border-primary/20 bg-[#16161a] p-4 transition-shadow duration-300 hover:border-primary/40 hover:shadow-[0_0_16px_rgba(255,215,0,0.1)] md:p-5`}
              >
                {/* Step number — sits on the connector line on desktop */}
                <div className="relative flex items-center gap-3 md:flex-col md:items-start md:gap-0">
                  <div className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-[#0a0a0b] text-xs font-bold tracking-wider text-primary transition-colors group-hover:bg-primary/10">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  {/* Icon — shown beside step number on mobile, below on desktop */}
                  <div className="flex size-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 md:mt-4 md:size-9">
                    <Icon className="size-4 text-primary md:size-5" aria-hidden="true" />
                  </div>
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold uppercase tracking-[2px] text-fg">
                    {step.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
