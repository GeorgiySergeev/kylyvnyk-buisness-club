// src/components/member/dashboard-ui.tsx
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
interface DashboardPageHeaderProps {
  description: string;
  eyebrow: string;
  title: string;
}

interface DashboardPanelProps {
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
}

interface DashboardQuickLinkProps {
  href: string;
  label: string;
}

export function DashboardPageHeader({ description, eyebrow, title }: DashboardPageHeaderProps) {
  return (
    <section aria-labelledby="dashboard-title" className="relative overflow-hidden pb-10 pt-2 md:pb-14">
      <div className="kc-how-it-works-bg pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative space-y-4 text-center">
        <span className="block text-[11px] font-normal uppercase tracking-[0.2em] text-ds-text-faint sm:text-ds-text-xs">
          {eyebrow}
        </span>
        <h1
          id="dashboard-title"
          className="font-sans text-3xl font-bold tracking-tight text-ds-text sm:text-4xl md:text-[2.75rem] md:leading-tight"
        >
          {title}
        </h1>
        <p className="mx-auto max-w-2xl text-ds-text-sm leading-relaxed text-ds-text-muted sm:text-ds-text-base">{description}</p>
      </div>
    </section>
  );
}

export function DashboardPanel({ children, className = '', description, title }: DashboardPanelProps) {
  return (
    <section className={`flex h-full flex-col ${className}`}>
      <div className="border-b border-ds-border px-ds-space-6 py-ds-space-6 sm:px-ds-space-8 sm:py-ds-space-8">
        <h2 className="text-ds-text-base font-semibold text-ds-text sm:text-ds-text-lg">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-xl text-ds-text-sm leading-relaxed text-ds-text-muted">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-ds-space-6 py-ds-space-6 sm:px-ds-space-8 sm:py-ds-space-8">{children}</div>
    </section>
  );
}

export function DashboardQuickLink({ href, label }: DashboardQuickLinkProps) {
  return (
    <Link
      className="inline-flex min-h-11 items-center gap-ds-space-2 text-ds-text-sm font-semibold text-ds-text transition-ds-transition-fast hover:text-ds-text-muted focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
      href={href}
    >
      <span>{label}</span>
      <ArrowRight aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.25} />
    </Link>
  );
}

interface DashboardIntroductionsBlockProps {
  actionHref?: string;
  actionLabel?: string;
  count: number;
  countLabel: string;
  description: string;
  title: string;
}

export function DashboardIntroductionsBlock({
  actionHref,
  actionLabel,
  count,
  countLabel,
  description,
  title,
}: DashboardIntroductionsBlockProps) {
  const hasAction = Boolean(actionHref && actionLabel);

  return (
    <section aria-labelledby="dashboard-introductions-title" className="relative overflow-hidden">
      <div className="kc-how-it-works-bg pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative border-y border-ds-border">
        <div
          className={cn(
            'grid grid-cols-1',
            hasAction
              ? 'md:grid-cols-[minmax(0,1fr)_10rem_auto]'
              : 'md:grid-cols-[minmax(0,1fr)_10rem]',
          )}
        >          <div className="px-ds-space-6 py-ds-space-8 sm:px-ds-space-8 sm:py-ds-space-10">
            <h2 id="dashboard-introductions-title" className="text-ds-text-base font-semibold text-ds-text sm:text-ds-text-lg">
              {title}
            </h2>
            <p className="mt-2 max-w-xl text-ds-text-sm leading-relaxed text-ds-text-muted">{description}</p>
          </div>

          <div className="flex flex-col items-center justify-center border-t border-ds-border px-ds-space-6 py-ds-space-6 text-center md:border-t-0 md:border-l md:py-ds-space-8">
            <p className="font-sans text-3xl font-bold leading-none text-ds-text">{count}</p>
            <p className="mt-2 text-ds-text-sm text-ds-text-muted">{countLabel}</p>
          </div>

          {hasAction ? (
            <div className="flex items-center justify-center border-t border-ds-border px-ds-space-6 py-ds-space-6 md:border-t-0 md:border-l md:px-ds-space-8 md:py-ds-space-8">
              <DashboardQuickLink href={actionHref!} label={actionLabel!} />
            </div>
          ) : null}        </div>
      </div>
    </section>
  );
}



interface DashboardProfileHeroProps {
  avatarUrl: string | null;
  displayName: string | null;
  fallbackInitials: string;
  memberTierLabel: string;
  notSetLabel: string;
}

export function DashboardProfileHero({
  avatarUrl,
  displayName,
  fallbackInitials,
  memberTierLabel,
  notSetLabel,
}: DashboardProfileHeroProps) {
  const resolvedName = displayName ?? notSetLabel;

  return (
    <div className="flex flex-col items-center gap-4 border-b border-ds-border px-ds-space-6 py-ds-space-8 text-center sm:flex-row sm:items-center sm:text-left">
      <Avatar className="size-20 border border-ds-border bg-ds-surface sm:size-24">
        <AvatarImage src={avatarUrl ?? undefined} alt="" />
        <AvatarFallback className="text-ds-text-lg text-ds-text-muted">{fallbackInitials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 space-y-2">
        <h1 className="truncate font-sans text-2xl font-bold tracking-tight text-ds-text sm:text-3xl">
          {resolvedName}
        </h1>
        <Badge className="uppercase tracking-[0.12em] text-ds-accent" variant="outline">
          {memberTierLabel}
        </Badge>
      </div>
    </div>
  );
}

interface DashboardTabPanelProps {
  children: ReactNode;
  className?: string;
  description?: string;
  embedded?: boolean;
  title: string;
}

export function DashboardTabPanel({
  children,
  className,
  description,
  embedded = false,
  title,
}: DashboardTabPanelProps) {
  if (embedded) {
    return (
      <section className={cn('space-y-4 border-t border-ds-border pt-ds-space-6 first:border-t-0 first:pt-0', className)}>
        <div>
          <h3 className="text-ds-text-base font-semibold text-ds-text">{title}</h3>
          {description ? (
            <p className="mt-1 max-w-xl text-ds-text-sm leading-relaxed text-ds-text-muted">{description}</p>
          ) : null}
        </div>
        {children}
      </section>
    );
  }

  return (
    <section className={cn('rounded-ds-radius-xl border border-ds-border bg-ds-surface', className)}>
      <div className="border-b border-ds-border px-ds-space-6 py-ds-space-5 sm:px-ds-space-8">
        <h2 className="text-ds-text-base font-semibold text-ds-text sm:text-ds-text-lg">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-xl text-ds-text-sm leading-relaxed text-ds-text-muted">{description}</p>
        ) : null}
      </div>
      <div className="px-ds-space-6 py-ds-space-6 sm:px-ds-space-8 sm:py-ds-space-8">{children}</div>
    </section>
  );
}

interface DashboardSettingsRowProps {
  action?: ReactNode;
  description: string;
  title: string;
}

export function DashboardSettingsRow({ action, description, title }: DashboardSettingsRowProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-ds-border py-ds-space-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h3 className="text-ds-text-sm font-semibold text-ds-text">{title}</h3>
        <p className="text-ds-text-sm leading-relaxed text-ds-text-muted">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

interface DashboardDangerZoneProps {
  action?: ReactNode;
  description: string;
  title: string;
  zoneLabel: string;
}

export function DashboardDangerZone({ action, description, title, zoneLabel }: DashboardDangerZoneProps) {
  return (
    <section
      aria-labelledby="dashboard-danger-zone-title"
      className="rounded-ds-radius-lg border border-ds-error/30 bg-ds-error/5 p-ds-space-4 sm:p-ds-space-5"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ds-error" />
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-ds-text-xs font-semibold uppercase tracking-[0.12em] text-ds-error">{zoneLabel}</p>
          <div className="space-y-1">
            <h3 id="dashboard-danger-zone-title" className="text-ds-text-sm font-semibold text-ds-error">
              {title}
            </h3>
            <p className="text-ds-text-sm leading-relaxed text-ds-error/80">{description}</p>
          </div>
          {action ? <div>{action}</div> : null}
        </div>
      </div>
    </section>
  );
}

interface DashboardIntroductionPanelProps {
  actionHref?: string;
  actionLabel?: string;
  count: number;
  countLabel: string;
  description: string;
}

export function DashboardIntroductionPanel({
  actionHref,
  actionLabel,
  count,
  countLabel,
  description,
}: DashboardIntroductionPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-6 rounded-ds-radius-md border border-ds-border bg-ds-surface px-ds-space-6 py-ds-space-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-sans text-4xl font-bold leading-none text-ds-text">{count}</p>
          <p className="text-ds-text-sm text-ds-text-muted">{countLabel}</p>
        </div>
        {actionHref && actionLabel ? (
          <DashboardQuickLink href={actionHref} label={actionLabel} />
        ) : null}
      </div>
      <p className="text-ds-text-sm leading-relaxed text-ds-text-muted">{description}</p>
    </div>
  );
}
