// src/components/home/how-it-works-section.tsx
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
    <section className="py-6 sm:py-10 md:py-12 z-10 relative">
      {/* Centered section header */}
      <div className="text-center mb-10 sm:mb-14 md:mb-16 space-y-2 sm:space-y-3">
        <span className="text-[9px] sm:text-[10px] font-semibold tracking-[4px] sm:tracking-[5px] text-primary uppercase block">
          PROCESS
        </span>
        <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white uppercase">
          {title}
        </h2>
        <div className="h-px w-12 sm:w-16 bg-primary/40 mx-auto mt-3 sm:mt-4" />
      </div>

      {/* Timeline wrapper */}
      <div className="relative max-w-5xl mx-auto">
        {/* Subtle decorative timeline background line for desktop */}
        <div
          className="absolute left-[12%] right-[12%] top-[30px] sm:top-[35px] hidden h-[0.5px] bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block z-0"
          aria-hidden="true"
        />

        {/* Steps grid - Stack on mobile, 2 cols on sm, 4 cols on desktop */}
        <ol className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-y-8 xs:gap-y-10 sm:gap-x-6 relative z-10" aria-label="How it works steps">
          {steps.map((step, index) => {
            const delay = FADE_DELAYS[index] ?? 'kc-fade-in';
            return (
              <li
                key={step.title}
                className={`${delay} flex flex-col items-center text-center group`}
              >
                {/* Large floating gold number with mobile-first sizes */}
                <div className="relative mb-3 sm:mb-5 md:mb-6">
                  <span className="font-display text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-primary select-none block transition-transform duration-500 group-hover:scale-110">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="absolute -inset-2 bg-primary/5 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>

                {/* Text details - fine padding for 2-col fitting */}
                <div className="space-y-1.5 px-2 sm:px-4">
                  <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-[2px] sm:tracking-[3px] text-fg leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs font-light leading-relaxed text-fg/60">
                    {step.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
