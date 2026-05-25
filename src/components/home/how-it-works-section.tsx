import { CreditCard, Percent, Search, UserPlus } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

const STEP_ICONS = [UserPlus, CreditCard, Search, Percent] as const;

interface StepData {
  title: string;
  text: string;
}

interface HowItWorksSectionProps {
  title: string;
  steps: StepData[];
}

export function HowItWorksSection({ title, steps }: HowItWorksSectionProps) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2 md:mb-6 md:gap-4">
        <div className="h-px w-6 bg-primary md:w-8" />
        <h2 className="text-xs tracking-[4.8px] text-fg uppercase md:text-xl">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[index];
          return (
            <Card key={step.title} className="border-primary/30 bg-card p-4 md:p-6">
              <CardHeader className="flex flex-row items-center justify-between p-0">
                <span className="flex size-8 items-center justify-center rounded-full border border-primary text-[10px] tracking-[2px] text-primary md:text-xs">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <Icon className="size-4 text-primary md:size-6" aria-hidden="true" />
              </CardHeader>
              <CardContent className="mt-3 p-0 md:mt-4">
                <h3 className="text-sm tracking-[3.2px] text-fg uppercase md:text-sm">{step.title}</h3>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground md:text-xs">{step.text}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
