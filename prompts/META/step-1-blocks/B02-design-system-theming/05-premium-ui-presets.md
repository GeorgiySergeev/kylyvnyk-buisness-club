05-premium-ui-presets.md
Title
Premium UI Presets — gold CTAs, cards, and sections

Objective
Create reusable, accessible UI presets aligned with black & gold: CTA buttons, premium cards, and section wrappers.

Steps
Add a gold CTA variant that composes shadcn Button.
Create premium Card variant (shadow, borders, spacing).
Add Section wrapper with mobile-first spacing and max-width.
Provide sample CTA row for the landing hero.
Files to add
src/components/ui/gold-button.tsx
src/components/ui/card-premium.tsx
src/components/ui/section.tsx
src/components/common/cta-row.tsx
src/components/ui/gold-button.tsx
tsx

copy
'use client';

import { cn } from '@/lib/utils/cn'; // create a tiny cn util if not present
import { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'md' | 'lg';
};

export function GoldButton({ className, size = 'lg', ...props }: Props) {
  const base =
    'gold-gradient text-fgOnGold font-semibold rounded-md focus-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
  const sizing = size === 'lg' ? 'px-6 py-4 text-base' : 'px-5 py-3 text-sm';
  return <button className={cn(base, sizing, 'shadow-cta', className)} {...props} />;
}
src/components/ui/card-premium.tsx
tsx

copy
import { cn } from '@/lib/utils/cn';
import { HTMLAttributes } from 'react';

export function CardPremium({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg bg-card border border-border shadow-soft',
        'p-5 md:p-6',
        className
      )}
      {...props}
    />
  );
}
src/components/ui/section.tsx
tsx

copy
import { cn } from '@/lib/utils/cn';

export function Section({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <section className={cn('py-10 md:py-14', className)}>
      <div className="container">{children}</div>
    </section>
  );
}
src/components/common/cta-row.tsx
tsx

copy
import { GoldButton } from '@/components/ui/gold-button';

export function CtaRow() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <GoldButton>Get a Club Card</GoldButton>
      <GoldButton className="opacity-95 hover:opacity-100">Become VIP — $19.99/mo</GoldButton>
      <button className="px-6 py-4 text-base font-semibold rounded-md border border-border text-fg hover:bg-bgElev focus-gold">
        Submit a Business
      </button>
    </div>
  );
}
src/lib/utils/cn.ts (if missing)
ts

copy
export function cn(...args: Array<string | undefined | false | null>) {
  return args.filter(Boolean).join(' ');
}
Acceptance
Buttons are at least 44px height on mobile.
Premium card and section wrappers available and consistent.
CTA row matches black & gold style and is keyboard-accessible (focus styles visible).