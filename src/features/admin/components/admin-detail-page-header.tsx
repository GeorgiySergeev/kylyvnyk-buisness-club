import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface AdminDetailPageHeaderProps {
  backHref: string;
  backLabel: string;
  children?: ReactNode;
  meta?: string;
  subtitle?: string;
  title: string;
  titleClassName?: string;
}

export function AdminDetailPageHeader({
  backHref,
  backLabel,
  children,
  meta,
  subtitle,
  title,
  titleClassName,
}: AdminDetailPageHeaderProps) {
  return (
    <header className="space-y-4">
      <Link
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ds-text-muted transition-colors hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
        href={backHref}
      >
        <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
        {backLabel}
      </Link>

      <div className="relative overflow-hidden rounded-ds-radius-xl border border-ds-border bg-ds-surface p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-ds-accent-subtle/70 to-transparent" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-1.5">
            {meta ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ds-accent/80">{meta}</p>
            ) : null}
            <p className={titleClassName ?? 'truncate text-2xl font-semibold tracking-tight text-ds-text'}>{title}</p>
            {subtitle ? <p className="truncate text-sm text-ds-text-muted">{subtitle}</p> : null}
          </div>

          {children ? <div className="min-w-0 lg:max-w-[70%]">{children}</div> : null}
        </div>
      </div>
    </header>
  );
}
