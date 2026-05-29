// src/components/member/dashboard-ui.tsx
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

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
