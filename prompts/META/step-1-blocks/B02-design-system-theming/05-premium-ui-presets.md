# 05. Premium UI Presets

## Objective

Create reusable, accessible UI presets aligned with the black & gold theme: CTA buttons, premium cards, and section wrappers.

## Steps

1. Add a gold CTA variant that composes the shadcn `Button` pattern.
2. Create a premium `Card` variant with elevated shadows and defined borders.
3. Add a `Section` wrapper with mobile-first spacing and constrained width.
4. Provide a sample CTA row for the landing hero.

## Files to Add

- `src/components/ui/gold-button.tsx`
- `src/components/ui/card-premium.tsx`
- `src/components/ui/section.tsx`
- `src/components/common/cta-row.tsx`
- `src/lib/utils/cn.ts` (if missing)

### `src/components/ui/gold-button.tsx`

```tsx
'use client';

// create a tiny cn util if not present
import { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'md' | 'lg';
};

export function GoldButton({ className, size = 'lg', ...props }: Props) {
  const base =
    'gold-gradient text-fgOnGold font-semibold rounded-md focus-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
  const sizing = size === 'lg' ? 'px-6 py-4 text-base' : 'px-5 py-3 text-sm';
  return <button className={cn(base, sizing, 'shadow-cta', className)} {...props} />;
}
```

### `src/components/ui/card-premium.tsx`

```tsx
import { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

export function CardPremium({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg bg-card border border-border shadow-soft', 'p-5 md:p-6', className)}
      {...props}
    />
  );
}
```

### `src/components/ui/section.tsx`

```tsx
import { cn } from '@/lib/utils/cn';

export function Section({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <section className={cn('py-10 md:py-14', className)}>
      <div className="container">{children}</div>
    </section>
  );
}
```

### `src/components/common/cta-row.tsx`

```tsx
import { GoldButton } from '@/components/ui/gold-button';

export function CtaRow() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
      <GoldButton>Get a Club Card</GoldButton>
      <GoldButton className="opacity-95 hover:opacity-100">Become VIP — $19.99/mo</GoldButton>
      <button className="px-6 py-4 text-base font-semibold rounded-md border border-border text-fg hover:bg-bgElev focus-gold">
        Submit a Business
      </button>
    </div>
  );
}
```

### `src/lib/utils/cn.ts`

```ts
export function cn(...args: Array<string | undefined | false | null>) {
  return args.filter(Boolean).join(' ');
}
```

## Acceptance Criteria

- Buttons are at least 44px in height on mobile.
- Premium card and section wrappers are available and visually consistent.
- CTA row matches the black & gold style and remains keyboard-accessible (focus styles visible).
