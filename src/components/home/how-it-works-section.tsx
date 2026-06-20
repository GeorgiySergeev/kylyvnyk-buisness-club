// src/components/home/how-it-works-section.tsx
import { ArrowRight } from 'lucide-react';

interface StepData {
  title: string;
  text: string;
}

interface HowItWorksSectionProps {
  eyebrow: string;
  steps: StepData[];
  subtitle: string;
  title: string;
}

export function HowItWorksSection({ eyebrow, steps, subtitle, title }: HowItWorksSectionProps) {
  return (
    <section
      aria-labelledby="how-it-works-title"
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
            id="how-it-works-title"
            className="font-sans text-3xl font-bold tracking-tight text-ds-text sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            {title}
          </h2>
          <p className="mx-auto max-w-2xl text-ds-text-sm leading-relaxed text-ds-text-muted sm:text-ds-text-base">
            {subtitle}
          </p>
        </div>

        <ol
          className="grid grid-cols-1 border-y border-ds-border md:grid-cols-3"
          aria-label="How it works steps"
        >
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;

            return (
              <li
                key={step.title}
                className={`relative px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 ${
                  index > 0
                    ? 'border-t border-ds-border md:border-t-0 md:border-l md:border-ds-border'
                    : ''
                }`}
              >
                <div className="space-y-3 md:pr-6">
                  <h3 className="text-ds-text-base font-semibold text-ds-text sm:text-ds-text-lg">{step.title}</h3>
                  <p className="max-w-sm text-ds-text-sm leading-relaxed text-ds-text-muted sm:text-[15px]">
                    {step.text}
                  </p>
                </div>

                {!isLast ? (
                  <div
                    className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 translate-x-1/2 text-ds-text-muted md:flex"
                    aria-hidden="true"
                  >
                    <ArrowRight className="size-4" strokeWidth={1.25} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
