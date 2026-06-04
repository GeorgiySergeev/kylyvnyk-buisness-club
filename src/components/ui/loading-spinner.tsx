import type { SVGProps } from 'react';

import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps extends SVGProps<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ className, size = 'md', ...props }: LoadingSpinnerProps) {
  const sizeClasses = {
    lg: 'size-6',
    md: 'size-5',
    sm: 'size-4',
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', sizeClasses[size], className)}
      {...props}
    >
      {/* Subtle background track */}
      <circle cx="12" cy="12" r="10" className="opacity-20" />
      {/* 90-degree spinning arc */}
      <path d="M22 12A10 10 0 0 0 12 2" />
    </svg>
  );
}
