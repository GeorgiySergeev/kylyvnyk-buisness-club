import { ArrowUpRight, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type StatusTone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

const statusToneClasses: Record<StatusTone, string> = {
  danger: 'bg-ds-error-subtle text-ds-error',
  default: 'bg-ds-surface-2 text-ds-text-muted',
  info: 'bg-ds-accent-subtle text-ds-accent',
  muted: 'bg-ds-surface text-ds-text-faint',
  success: 'bg-ds-success-subtle text-ds-success',
  warning: 'bg-ds-warning-subtle text-ds-warning',
};

export function getAdminStatusTone(status: string): StatusTone {
  if (['ACTIVE', 'PUBLISHED', 'APPROVED', 'SUCCEEDED'].includes(status)) return 'success';
  if (['SUBMITTED', 'UNDER_REVIEW', 'VIP', 'BUSINESS'].includes(status))
    return 'warning';
  if (['HIDDEN', 'REJECTED', 'BANNED', 'EXPIRED', 'FAILED'].includes(status)) return 'danger';
  if (['ADMIN'].includes(status)) return 'default';
  if (['FREE', 'INACTIVE', 'CLOSED'].includes(status)) return 'muted';
  return 'info';
}

export function AdminPageHeader({
  actions,
  description,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-ds-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1.5">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ds-accent/80">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="truncate text-2xl font-semibold text-ds-text">{title}</h1>
        {description ? (
          <p className="max-w-3xl text-ds-text-sm text-ds-text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminMetricCard({
  href,
  icon,
  label,
  meta,
  tone = 'default',
  value,
}: {
  href?: string;
  icon?: ReactNode;
  label: string;
  meta?: string;
  tone?: StatusTone;
  value: ReactNode;
}) {
  const content = (
    <Card className="h-full border-ds-border bg-ds-surface shadow-none transition-colors hover:border-ds-border-strong">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-5 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-ds-text-sm font-medium text-ds-text-muted">{label}</CardTitle>
          {meta ? <p className="text-ds-text-xs text-ds-text-faint">{meta}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          {icon ? (
            <div className="flex size-9 items-center justify-center rounded-ds-radius-md border border-ds-border bg-ds-bg text-ds-text-muted">
              {icon}
            </div>
          ) : null}
          {href ? <ArrowUpRight className="size-4 text-ds-text-faint" /> : null}
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-0">
        <div
          className={cn(
            'font-mono text-3xl font-semibold text-ds-text',
            tone === 'success' && 'text-ds-success',
            tone === 'warning' && 'text-ds-warning',
            tone === 'danger' && 'text-ds-error',
          )}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );

  return href ? <Link className="block h-full" href={href}>{content}</Link> : content;
}

export function AdminPanel({
  children,
  className,
  description,
  title,
}: {
  children: ReactNode;
  className?: string;
  description?: string;
  title?: string;
}) {
  return (
    <Card className={cn('border-ds-border bg-ds-surface shadow-none', className)}>
      {title ? (
        <CardHeader className="space-y-1 border-b border-ds-border p-5">
          <CardTitle className="text-ds-text-base font-semibold text-ds-text">{title}</CardTitle>
          {description ? <p className="text-ds-text-sm text-ds-text-muted">{description}</p> : null}
        </CardHeader>
      ) : null}
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

export function AdminFiltersBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-ds-radius-md border border-ds-border bg-ds-surface p-3 sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminSearchInput({
  name = 'q',
  placeholder,
  value,
}: {
  name?: string;
  placeholder: string;
  value?: string;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:min-w-64">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ds-text-muted" />
      <Input
        className="h-9 border-ds-border bg-ds-bg pl-9 text-ds-text-sm"
        defaultValue={value}
        name={name}
        placeholder={placeholder}
        type="search"
      />
    </div>
  );
}

export function AdminDataTableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-ds-radius-md border border-ds-border bg-ds-surface">{children}</div>
  );
}

export function AdminStatusBadge({ children, tone }: { children: ReactNode; tone?: StatusTone }) {
  return (
    <Badge
      className={cn(
        'uppercase',
        statusToneClasses[tone ?? getAdminStatusTone(String(children))],
      )}
    >
      {children}
    </Badge>
  );
}

export function AdminMobileCard({
  actions,
  badge,
  href,
  rows,
  subtitle,
  title,
}: {
  actions?: ReactNode;
  badge?: ReactNode;
  href?: string;
  rows: Array<{ label: string; value: ReactNode }>;
  subtitle?: string;
  title: ReactNode;
}) {
  const inner = (
    <div className="rounded-ds-radius-lg border border-ds-border bg-ds-surface p-ds-space-3 shadow-ds-shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-ds-text-sm font-semibold text-ds-text">{title}</span>
            {badge ? <span className="shrink-0">{badge}</span> : null}
          </div>
          {subtitle ? (
            <p className="mt-0.5 truncate text-ds-text-xs text-ds-text-muted">{subtitle}</p>
          ) : null}
        </div>
        {href ? <ChevronRight className="mt-0.5 size-4 shrink-0 text-ds-text-muted" /> : null}
      </div>
      {rows.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-ds-text-xs text-ds-text-muted">
          {rows.map((row) => (
            <div key={row.label} className="min-w-0">
              <span className="text-ds-text-xs font-semibold uppercase tracking-wider text-ds-text-muted/70">
                {row.label}
              </span>
              <div className="mt-0.5 text-ds-text">{row.value}</div>
            </div>
          ))}
        </div>
      ) : null}
      {actions ? <div className="mt-2 flex flex-wrap gap-1.5 border-t border-ds-border pt-ds-space-2">{actions}</div> : null}
    </div>
  );

  if (href) {
    return <a className="block" href={href}>{inner}</a>;
  }

  return inner;
}

export function AdminEmptyState({ description, title }: { description?: string; title: string }) {
  return (
    <div className="rounded-ds-radius-md border border-dashed border-ds-border bg-ds-surface p-ds-space-8 text-center">
      <p className="text-ds-text-sm font-medium text-ds-text">{title}</p>
      {description ? <p className="mt-1 text-ds-text-sm text-ds-text-muted">{description}</p> : null}
    </div>
  );
}

export function AdminDescriptionList({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-ds-radius-md border border-ds-border bg-ds-border sm:grid-cols-2">
      {items.map((item) => (
        <div className="bg-ds-surface p-ds-space-3" key={item.label}>
          <dt className="text-ds-text-xs font-semibold uppercase tracking-[0.18em] text-ds-text-muted">
            {item.label}
          </dt>
          <dd className="mt-1 break-words text-ds-text-sm text-ds-text">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
