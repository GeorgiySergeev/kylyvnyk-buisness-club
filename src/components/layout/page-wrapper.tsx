import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  flush?: boolean;
  noTopPad?: boolean;
}

export function PageWrapper({
  children,
  className,
  flush = false,
  noTopPad = false,
}: PageWrapperProps) {
  return (
    <div
      className={cn(
        'kc-container pb-16 md:pb-24',
        !noTopPad && 'pt-10 md:pt-16',
        flush && 'px-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
