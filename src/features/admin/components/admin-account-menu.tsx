'use client';

import { LayoutDashboard, LogOut, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/features/auth/actions/phone-auth.action';

export interface AdminAccountMenuLabels {
  accountMenuLabel: string;
  adminRole: string;
  goToAdminDashboard: string;
  goToMemberDashboard: string;
  goToProfile: string;
  signOut: string;
  title: string;
}

interface AdminAccountMenuProps {
  className?: string;
  locale: SupportedLocale;
  labels: AdminAccountMenuLabels;
}

export function AdminAccountMenu({ className, locale, labels }: AdminAccountMenuProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={labels.accountMenuLabel}
        className={className}
      >
        <Avatar className="size-8">
          <AvatarFallback className="rounded-full bg-ds-surface-2 text-ds-text-xs text-ds-text">
            K
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 min-w-60">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-ds-text-sm font-medium text-ds-text">{labels.title}</span>
            <span className="text-ds-text-xs text-ds-text-muted">{labels.adminRole}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={localizeHref(locale, '/admin')}>
            <Shield className="size-4" />
            {labels.goToAdminDashboard}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={localizeHref(locale, '/m/dashboard')}>
            <LayoutDashboard className="size-4" />
            {labels.goToMemberDashboard}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href={localizeHref(locale, '/admin/profile')}>
            <User className="size-4" />
            {labels.goToProfile}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await signOutAction();
              router.push(localizeHref(locale, '/'));
              router.refresh();
            });
          }}
        >
          <LogOut className="size-4" />
          {labels.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
