import { Globe2, Handshake, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

const STATS_ICONS = [Users, Globe2, Handshake] as const;

interface StatsSectionProps {
  stats: Array<{ value: string; label: string }>;
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section>
      <div className="grid grid-cols-3 gap-3 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = STATS_ICONS[index];
          return (
            <Card key={stat.label} className="border-primary/30 bg-card p-4 text-center md:p-6">
              <CardContent className="flex flex-col items-center gap-2 p-0">
                <div className="flex size-10 items-center justify-center rounded-full border-2 border-primary md:size-14">
                  <Icon className="size-4 text-primary md:size-6" aria-hidden="true" />
                </div>
                <span className="font-display text-lg leading-7 text-primary md:text-3xl">
                  {stat.value}
                </span>
                <span className="text-[9px] tracking-[4.8px] text-muted-foreground uppercase md:text-xs">
                  {stat.label}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
