import Link from 'next/link';

import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  href?: string;
  label: string;
}

interface BreadcrumbsProps {
  ariaLabel: string;
  className?: string;
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ ariaLabel, className, items }: BreadcrumbsProps) {
  return (
    <nav aria-label={ariaLabel} className={cn('text-xs text-muted-foreground', className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li className="flex items-center gap-1.5" key={`${item.label}-${index}`}>
              {item.href && !isLast ? (
                <Link
                  className="transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  href={item.href}
                >
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast && 'font-medium text-foreground')}>{item.label}</span>
              )}
              {!isLast ? <span aria-hidden="true">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
