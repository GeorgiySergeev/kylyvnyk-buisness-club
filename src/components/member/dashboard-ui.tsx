// src/components/member/dashboard-ui.tsx
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
        <span className="block text-[11px] font-normal uppercase tracking-[0.2em] text-fg/45 sm:text-xs">
          {eyebrow}
        </span>
        <h1
          id="dashboard-title"
          className="font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-tight"
        >
          {title}
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-fg/50 sm:text-base">{description}</p>
      </div>
    </section>
  );
}

export function DashboardPanel({ children, className = '', description, title }: DashboardPanelProps) {
  return (
    <section className={`flex h-full flex-col ${className}`}>
      <div className="border-b border-border/50 px-6 py-6 sm:px-8 sm:py-8">
        <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg/50">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-6 py-6 sm:px-8 sm:py-8">{children}</div>
    </section>
  );
}

export function DashboardQuickLink({ href, label }: DashboardQuickLinkProps) {
  return (
    <Link
      className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white transition-colors hover:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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

      <div className="relative border-y border-border/50">
        <div
          className={cn(
            'grid grid-cols-1',
            hasAction
              ? 'md:grid-cols-[minmax(0,1fr)_10rem_auto]'
              : 'md:grid-cols-[minmax(0,1fr)_10rem]',
          )}
        >          <div className="px-6 py-8 sm:px-8 sm:py-10">
            <h2 id="dashboard-introductions-title" className="text-base font-semibold text-white sm:text-lg">
              {title}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg/50">{description}</p>
          </div>

          <div className="flex flex-col items-center justify-center border-t border-border/50 px-6 py-6 text-center md:border-t-0 md:border-l md:py-8">
            <p className="font-sans text-3xl font-bold leading-none text-white">{count}</p>
            <p className="mt-2 text-sm text-fg/50">{countLabel}</p>
          </div>

          {hasAction ? (
            <div className="flex items-center justify-center border-t border-border/50 px-6 py-6 md:border-t-0 md:border-l md:px-8 md:py-8">
              <DashboardQuickLink href={actionHref!} label={actionLabel!} />
            </div>
          ) : null}        </div>
      </div>
    </section>
  );
}

export function DashboardEmptyState({ description, title }: { description: string; title: string }) {
  return (
    <div className="rounded-md border border-border/50 bg-white/2 px-5 py-5">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fg/50">{description}</p>
    </div>
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
    <div className="flex flex-col items-center gap-4 border-b border-border/50 px-6 py-8 text-center sm:flex-row sm:items-center sm:text-left">
      <Avatar className="size-20 border border-border/50 bg-white/2 sm:size-24">
        <AvatarImage src={avatarUrl ?? undefined} alt="" />
        <AvatarFallback className="text-lg text-fg/60">{fallbackInitials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 space-y-2">
        <h1 className="truncate font-sans text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {resolvedName}
        </h1>
        <span className="inline-flex min-h-8 items-center rounded-md border border-primary/40 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          {memberTierLabel}
        </span>
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
      <section className={cn('space-y-4 border-t border-border/50 pt-6 first:border-t-0 first:pt-0', className)}>
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {description ? (
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-fg/50">{description}</p>
          ) : null}
        </div>
        {children}
      </section>
    );
  }

  return (
    <section className={cn('rounded-xl border border-border/50 bg-card/30', className)}>
      <div className="border-b border-border/50 px-6 py-5 sm:px-8">
        <h2 className="text-base font-semibold text-white sm:text-lg">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg/50">{description}</p>
        ) : null}
      </div>
      <div className="px-6 py-6 sm:px-8 sm:py-8">{children}</div>
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
    <div className="flex flex-col gap-4 border-b border-border/50 py-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="text-sm leading-relaxed text-fg/50">{description}</p>
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
      className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-destructive">{zoneLabel}</p>
          <div className="space-y-1">
            <h3 id="dashboard-danger-zone-title" className="text-sm font-semibold text-destructive">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-destructive/80">{description}</p>
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
      <div className="flex flex-col items-center gap-6 rounded-md border border-border/50 bg-white/2 px-6 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="font-sans text-4xl font-bold leading-none text-white">{count}</p>
          <p className="text-sm text-fg/50">{countLabel}</p>
        </div>
        {actionHref && actionLabel ? (
          <DashboardQuickLink href={actionHref} label={actionLabel} />
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-fg/50">{description}</p>
    </div>
  );
}
