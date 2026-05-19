# 05-cta-buttons-gold-mobile-first.md

## Title

Gold CTAs — primary, secondary, loading state (mobile-first)

## Objective

Provide high-contrast, accessible CTA buttons consistent with black & gold theme. Include loading state and link-as-button variant.

## Steps

1) If GoldButton from B05 exists, keep it; add LoadingButton and LinkButton variants.
2) Ensure minimum touch target (≥44px).
3) Provide ARIA and focus ring.

## Files to add/modify

- src/components/ui/gold-button.tsx (augment if present)
- src/components/ui/loading-spinner.tsx
- src/components/ui/link-button.tsx

### src/components/ui/loading-spinner.tsx

```tsx
export function LoadingSpinner({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}
```

### src/components/ui/gold-button.tsx (augment with loading)

```tsx
'use client';

import { cn } from '@/lib/utils/cn';
import { ButtonHTMLAttributes } from 'react';
import { LoadingSpinner } from './loading-spinner';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'md' | 'lg';
  loading?: boolean;
};

export function GoldButton({ className, size = 'lg', loading, children, ...props }: Props) {
  const base =
    'gold-gradient text-fgOnGold font-semibold rounded-md focus-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed';
  const sizing = size === 'lg' ? 'px-6 py-4 text-base' : 'px-5 py-3 text-sm';
  return (
    <button
      className={cn(base, 'shadow-cta', sizing, className)}
      aria-busy={loading ? 'true' : undefined}
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        {loading && <LoadingSpinner className="text-fgOnGold" />}
        {children}
      </span>
    </button>
  );
}
```

### src/components/ui/link-button.tsx

```tsx
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

export function LinkButton({
  href,
  children,
  variant = 'outline',
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'gold' | 'outline';
  className?: string;
}) {
  if (variant === 'gold') {
    return (
      <Link href={href} className={cn('gold-gradient text-fgOnGold px-6 py-4 rounded-md focus-gold shadow-cta', className)}>
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        'px-6 py-4 rounded-md border border-border text-fg hover:bg-bgElev focus-gold',
        className
      )}
    >
      {children}
    </Link>
  );
}
```

## Acceptance

- GoldButton supports loading state and ≥44px height on mobile.
- LinkButton has gold and outline variants.
- Focus ring visible; color contrast remains AA-compliant.
