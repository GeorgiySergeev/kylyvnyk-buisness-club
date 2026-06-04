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
    <header className="space-y-6">
      <Link
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-ds-text-muted transition-colors hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
        href={backHref}
      >
        <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
        {backLabel}
      </Link>

      <div className="min-w-0">
        <p className={titleClassName ?? 'truncate text-sm font-medium text-ds-text'}>{title}</p>
        {subtitle ? <p className="truncate text-xs text-ds-text-muted">{subtitle}</p> : null}
        {meta ? (
          <p className="mt-1 text-[10px] uppercase tracking-widest text-ds-text-muted">{meta}</p>
        ) : null}
      </div>

      {children}
    </header>
  );
}
