import { Slot } from '@radix-ui/react-slot';
import { cva,type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-0.5 overflow-hidden rounded-ds-radius-sm border border-transparent px-1.5 text-ds-text-xs font-medium whitespace-nowrap transition-ds-transition-fast focus-visible:border-ds-accent focus-visible:ring-[3px] focus-visible:ring-ds-accent-subtle has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 [&>svg]:pointer-events-none [&>svg]:size-2.5!',
  {
    variants: {
      variant: {
        default: 'bg-ds-surface-2 text-ds-text-muted',
        success: 'bg-ds-success-subtle text-ds-success',
        warning: 'bg-ds-warning-subtle text-ds-warning',
        error: 'bg-ds-error-subtle text-ds-error',
        destructive: 'bg-ds-error-subtle text-ds-error',
        info: 'bg-ds-accent-subtle text-ds-accent',
        outline: 'border-ds-border text-ds-text',
        secondary: 'bg-ds-surface-2 text-ds-text-muted',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
