import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('rounded-ds-radius-md bg-gradient-to-r from-ds-surface-2 via-ds-surface-hover to-ds-surface-2 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite]', className)}
      {...props}
    />
  );
}

export { Skeleton };
