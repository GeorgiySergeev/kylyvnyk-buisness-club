'use client';

import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface RowAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export function AdminRowActions({
  actions,
  actionLabel,
}: {
  actions: RowAction[];
  actionLabel: string;
}) {
  const router = useRouter();
  const defaultActions = actions.filter((a) => !a.destructive);
  const destructiveActions = actions.filter((a) => a.destructive);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-8 text-foreground" size="icon" variant="ghost">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">{actionLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {defaultActions.map((action, i) => (
          <DropdownMenuItem
            key={i}
            disabled={action.disabled}
            onClick={() => {
              action.onClick?.();
              if (action.href) router.push(action.href);
            }}
            title={action.disabledReason}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
        {destructiveActions.length > 0 && defaultActions.length > 0 && (
          <DropdownMenuSeparator />
        )}
        {destructiveActions.map((action, i) => (
          <DropdownMenuItem
            key={i}
            disabled={action.disabled}
            onClick={() => action.onClick?.()}
            title={action.disabledReason}
            variant="destructive"
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
