'use client';

import Link from 'next/link';

import { DashboardEmptyState, DashboardQuickLink } from '@/components/member/dashboard-ui';
import { Badge } from '@/components/ui/badge';

interface BusinessStatusPanelProps {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  publicHref?: string;
  publicLabel?: string;
  status: string | null;
  statusLabel: string;
  title: string;
}

export function BusinessStatusPanel({
  actionHref,
  actionLabel,
  description,
  publicHref,
  publicLabel,
  status,
  statusLabel,
  title,
}: BusinessStatusPanelProps) {
  if (!status) {
    return (
      <div className="space-y-4">
        <DashboardEmptyState description={description} title={title} />
        {actionHref && actionLabel ? (
          <Link
            className="inline-flex min-h-11 items-center rounded-md border border-primary/40 bg-primary px-4 text-sm font-semibold text-primary-foreground"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border/50 bg-white/2 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <Badge className="uppercase tracking-[0.12em] text-primary" variant="outline">
          {statusLabel}: {status}
        </Badge>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-fg/50">{description}</p>
      <div className="mt-4 flex flex-wrap gap-4">
        {publicHref && publicLabel ? <DashboardQuickLink href={publicHref} label={publicLabel} /> : null}
        {actionHref && actionLabel ? <DashboardQuickLink href={actionHref} label={actionLabel} /> : null}
      </div>
    </div>
  );
}
