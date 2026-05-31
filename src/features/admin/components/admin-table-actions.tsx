import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { TableCell, TableHead } from '@/components/ui/table';
import { cn } from '@/lib/utils';

/** Shared layout for the trailing actions column in admin data tables. */
export const adminTableActionsHeadClassName =
  'w-10 pr-4 text-right';

export const adminTableActionsCellClassName = 'pr-4 text-right';

export function AdminTableActionsHead({ className, label }: { className?: string; label: string }) {
  return (
    <TableHead className={cn(adminTableActionsHeadClassName, className)}>{label}</TableHead>
  );
}

export function AdminTableActionsCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <TableCell className={cn(adminTableActionsCellClassName, className)}>{children}</TableCell>;
}

/** Icon-only row action — navigates to a detail route (users, businesses, cards, …). */
export function AdminTableNavigateAction({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild className="size-8 text-foreground" size="icon" variant="ghost">
      <Link href={href}>
        <MoreHorizontal aria-hidden className="size-4" />
        <span className="sr-only">{label}</span>
      </Link>
    </Button>
  );
}

/** Icon-only trigger for row dropdown menus (edit / delete, etc.). */
export function AdminTableRowMenuTrigger({
  className,
  label,
}: {
  className?: string;
  label: string;
}) {
  return (
    <Button
      className={cn('size-8 text-foreground', className)}
      size="icon"
      type="button"
      variant="ghost"
    >
      <MoreHorizontal aria-hidden className="size-4" />
      <span className="sr-only">{label}</span>
    </Button>
  );
}
