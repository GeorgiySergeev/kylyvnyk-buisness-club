import type { ComponentPropsWithoutRef } from 'react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function CardPremium({ className, ...props }: ComponentPropsWithoutRef<typeof Card>) {
  return (
    <Card
      className={cn(
        'rounded-xl border-border/80 bg-card/95 shadow-soft backdrop-blur-sm',
        'transition-shadow hover:shadow-gold',
        className,
      )}
      {...props}
    />
  );
}
