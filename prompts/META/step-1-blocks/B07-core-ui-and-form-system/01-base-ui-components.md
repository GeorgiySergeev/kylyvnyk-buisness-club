# 01-base-ui-components.md

## Title

Base UI Components — inputs, selects, labels, cards (accessible + tokenized)

## Objective

Provide a minimal, accessible set of base UI components built on shadcn/ui and Tailwind tokens: Input, Textarea, Select, Label, Card. Unify styles and a small utility.

## Steps

1. Ensure shadcn/ui is installed (B05). If not, run add commands for: input, textarea, label, select, card, badge, separator.
2. Create a tiny cn helper.
3. Add a base Fieldset wrapper for grouping fields.
4. Create a barrel export for ui components.

## Commands (if needed)

```bash
pnpm dlx shadcn@latest add input textarea label select card badge separator
```

## Files to add/modify

- src/lib/utils/cn.ts (if missing)
- src/components/ui/fieldset.tsx
- src/components/ui/index.ts

### src/lib/utils/cn.ts

```ts
export function cn(...args: Array<string | undefined | false | null>) {
  return args.filter(Boolean).join(' ');
}
```

### src/components/ui/fieldset.tsx

```tsx
import { cn } from '@/lib/utils/cn';

export function Fieldset({
  legend,
  className,
  children,
}: React.PropsWithChildren<{ legend?: string; className?: string }>) {
  return (
    <fieldset className={cn('space-y-3', className)}>
      {legend && <legend className="mb-2 text-sm font-medium text-fgMuted">{legend}</legend>}
      {children}
    </fieldset>
  );
}
```

### src/components/ui/index.ts

```ts
export * from './badge';
export * from './card';
export * from './input';
export * from './label';
export * from './select';
export * from './separator';
export * from './fieldset';
```

## Acceptance

- Importing from "@/components/ui" exposes base shadcn components and Fieldset.
- Inputs render with dark theme and clear focus (focus ring visible).
- No style regressions on tokenized black & gold palette.
