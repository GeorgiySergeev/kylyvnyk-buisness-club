import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  description?: string;
  icon?: React.ReactNode;
  title: string;
}

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-ds-radius-lg border border-dashed border-ds-border bg-ds-surface p-8 text-center animate-in fade-in-50 duration-500',
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-ds-surface-hover text-ds-text-muted">
          {icon}
        </div>
      ) : null}
      <h3 className="text-ds-text-lg font-semibold text-ds-text">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-ds-text-sm text-ds-text-muted">{description}</p>
      ) : null}
      {action ? (
        <Button
          asChild={!!action.href}
          className="mt-6"
          onClick={action.onClick}
        >
          {action.href ? <a href={action.href}>{action.label}</a> : action.label}
        </Button>
      ) : null}
    </div>
  );
}
