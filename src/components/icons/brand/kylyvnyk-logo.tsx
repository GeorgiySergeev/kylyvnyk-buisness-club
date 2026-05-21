import type { SVGProps } from 'react';

import { cn } from '@/lib/utils';

interface KylyvnykLogoProps extends SVGProps<SVGSVGElement> {
  title?: string;
}

export function KylyvnykLogo({ className, title, ...props }: KylyvnykLogoProps) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn('text-fg-on-gold', className)}
      role={title ? 'img' : undefined}
      viewBox="0 0 64 64"
      {...props}
    >
      <defs>
        <linearGradient id="kylyvnyk-logo-gold" x1="8" x2="56" y1="8" y2="56">
          <stop offset="0" stopColor="var(--color-gold-900)" />
          <stop offset="0.52" stopColor="var(--color-gold)" />
          <stop offset="1" stopColor="var(--color-gold-400)" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" fill="url(#kylyvnyk-logo-gold)" r="30" />
      <path
        d="M21 43V21h4.8v9.25L34.1 21h5.85l-8.9 9.75L40.6 43h-5.95l-6.9-8.95-1.95 2.1V43H21Zm22.25 0V21H48v17.9h9.25V43h-14Z"
        fill="currentColor"
      />
    </svg>
  );
}
