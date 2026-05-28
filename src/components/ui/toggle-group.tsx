'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const toggleGroupVariants = cva(
  'inline-flex items-center gap-1 rounded-lg bg-muted p-1',
  {
    variants: {
      variant: {
        default: '',
        outline: 'border border-border bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

const toggleGroupItemVariants = cva(
  'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'text-muted-foreground hover:text-foreground data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm',
        outline:
          'text-muted-foreground hover:text-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
      },
      size: {
        default: 'h-8 px-3',
        sm: 'h-7 px-2 text-xs',
        lg: 'h-9 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

type ToggleGroupContextValue = VariantProps<typeof toggleGroupItemVariants>;

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  variant: 'default',
  size: 'default',
});

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleGroupVariants> &
  VariantProps<typeof toggleGroupItemVariants>) {
  return (
    <ToggleGroupContext.Provider value={{ variant, size }}>
      <ToggleGroupPrimitive.Root
        className={cn(toggleGroupVariants({ variant }), className)}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive.Root>
    </ToggleGroupContext.Provider>
  );
}

function ToggleGroupItem({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleGroupItemVariants>) {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      className={cn(
        toggleGroupItemVariants({
          variant: variant ?? context.variant,
          size: size ?? context.size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem, toggleGroupItemVariants,toggleGroupVariants };
