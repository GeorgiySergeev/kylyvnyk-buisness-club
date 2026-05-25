import { Search } from 'lucide-react';
import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type StatusTone = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

const statusToneClasses: Record<StatusTone, string> = {
  danger: 'border-red-500/25 bg-red-500/10 text-red-300',
  default: 'border-primary/30 bg-primary/10 text-primary',
  info: 'border-blue-500/25 bg-blue-500/10 text-blue-300',
  muted: 'border-white/10 bg-white/5 text-muted-foreground',
  success: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-500/25 bg-amber-500/10 text-amber-300',
};

export function getAdminStatusTone(status: string): StatusTone {
  if (['ACTIVE', 'PUBLISHED', 'APPROVED', 'SUCCEEDED'].includes(status)) return 'success';
  if (['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'VIP', 'BUSINESS'].includes(status))
    return 'warning';
  if (['HIDDEN', 'REJECTED', 'BANNED', 'EXPIRED', 'FAILED'].includes(status)) return 'danger';
  if (['ADMIN'].includes(status)) return 'default';
  if (['FREE', 'DRAFT', 'INACTIVE', 'CLOSED'].includes(status)) return 'muted';
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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminMetricCard({
  icon,
  label,
  meta,
  tone = 'default',
  value,
}: {
  icon?: ReactNode;
  label: string;
  meta?: string;
  tone?: StatusTone;
  value: ReactNode;
}) {
  return (
    <Card className="border-border/80 bg-card/95 shadow-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground">{label}</CardTitle>
        {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div
          className={cn(
            'text-2xl font-semibold tracking-tight text-foreground',
            tone === 'success' && 'text-emerald-300',
            tone === 'warning' && 'text-amber-300',
            tone === 'danger' && 'text-red-300',
          )}
        >
          {value}
        </div>
        {meta ? <p className="mt-1 text-xs text-muted-foreground">{meta}</p> : null}
      </CardContent>
    </Card>
  );
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
    <Card className={cn('border-border/80 bg-card/95 shadow-none', className)}>
      {title ? (
        <CardHeader className="space-y-1 p-4">
          <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn('p-4', title && 'pt-0')}>{children}</CardContent>
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
        'flex flex-col gap-3 rounded-md border border-border/80 bg-card/70 p-3 sm:flex-row sm:flex-wrap sm:items-center',
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
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="h-9 border-border/80 bg-background/80 pl-9 text-sm"
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
    <div className="overflow-hidden rounded-md border border-border/80 bg-card/95">{children}</div>
  );
}

export function AdminStatusBadge({ children, tone }: { children: ReactNode; tone?: StatusTone }) {
  return (
    <Badge
      className={cn(
        'rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.02em]',
        statusToneClasses[tone ?? getAdminStatusTone(String(children))],
      )}
      variant="outline"
    >
      {children}
    </Badge>
  );
}

export function AdminEmptyState({ description, title }: { description?: string; title: string }) {
  return (
    <div className="rounded-md border border-dashed border-border/80 bg-card/50 p-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </div>
  );
}

export function AdminDescriptionList({
  items,
}: {
  items: Array<{ label: string; value: ReactNode }>;
}) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-md border border-border/80 bg-border/80 sm:grid-cols-2">
      {items.map((item) => (
        <div className="bg-card p-3" key={item.label}>
          <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 break-words text-sm text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
