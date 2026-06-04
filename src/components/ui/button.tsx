import { cva,type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-ds-radius-md border border-transparent bg-clip-padding text-ds-text-sm font-medium whitespace-nowrap transition-ds-transition-base outline-none select-none focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ds-bg active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-ds-accent text-white hover:bg-ds-accent-hover',
        primary: 'bg-ds-accent text-white hover:bg-ds-accent-hover',
        outline: 'border border-ds-border bg-ds-surface-2 text-ds-text hover:bg-ds-surface-hover',
        secondary: 'border border-ds-border bg-ds-surface-2 text-ds-text hover:bg-ds-surface-hover',
        ghost: 'bg-transparent text-ds-text hover:bg-ds-surface-2',
        destructive: 'bg-transparent text-ds-error hover:bg-ds-error/10 focus-visible:ring-ds-error/50',
        link: 'text-ds-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4',
        md: 'h-9 px-4',
        sm: 'h-8 px-3',
        lg: 'h-10 px-8',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  isLoading = false,
  disabled,
  children,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    isLoading?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  if (asChild) {
    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || isLoading}
        {...props}
      >
        {children}
      </Comp>
    );
  }

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner className="mr-2" />}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
