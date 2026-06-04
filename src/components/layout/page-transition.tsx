'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className={cn('flex flex-1 flex-col animate-in fade-in duration-500 ease-ds-entrance', className)}
    >
      {children}
    </div>
  );
}
