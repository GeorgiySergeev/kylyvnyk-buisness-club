'use client';

import { Globe } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

export interface ClientCountryFlagProps {
  className?: string;
  iso2: string;
}

export function ClientCountryFlag({ className, iso2 }: ClientCountryFlagProps) {
  const [failed, setFailed] = useState(false);
  const code = iso2.trim().toLowerCase();

  if (!code || failed) {
    return (
      <Globe
        aria-hidden="true"
        className={cn('size-4 shrink-0 text-ds-text-muted', className)}
      />
    );
  }

  return (
    // Same-origin SVG sprites; next/image does not optimize inline SVG routes.
    // eslint-disable-next-line @next/next/no-img-element -- static flag route
    <img
      alt=""
      aria-hidden="true"
      className={cn(
        'inline-block h-3 w-[1.125rem] shrink-0 object-cover',
        className,
      )}
      height={12}
      loading="lazy"
      src={`/flags/${code}`}
      width={18}
      onError={() => setFailed(true)}
    />
  );
}
