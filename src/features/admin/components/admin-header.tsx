'use client';

import { Bell, ChevronRight, CircleDot, Moon, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import type { AdminNavKey, AdminNavLabels } from './admin-nav';

const BREADCRUMB_MAP: Record<string, AdminNavKey> = {
  '/admin': 'navDashboard',
  '/admin/users': 'navUsers',
  '/admin/businesses': 'navBusinesses',
  '/admin/cards': 'navCards',
  '/admin/introductions': 'navIntroductions',
  '/admin/memberships': 'navMemberships',
  '/admin/catalog': 'navCatalog',
  '/admin/audit': 'navAudit',
};

export interface AdminShellLabels extends AdminNavLabels {
  adminBrand: string;
  adminRole: string;
  adminSearchPlaceholder: string;
  backOffice: string;
  notifications: string;
  operational: string;
  theme: string;
  title: string;
}

interface AdminHeaderProps {
  labels: AdminShellLabels;
}

export function AdminHeader({ labels }: AdminHeaderProps) {
  const pathname = usePathname();

  const parts = pathname.split('/').filter(Boolean);
  const adminPath = `/${parts.slice(1, 3).join('/')}`;
  const pageTitle = BREADCRUMB_MAP[adminPath]
    ? labels[BREADCRUMB_MAP[adminPath]]
    : labels.title;

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 sm:px-6">
      <div className="hidden min-w-0 items-center gap-3 text-sm max-lg:hidden lg:flex">
        <span className="font-semibold tracking-tight text-foreground">{labels.adminBrand}</span>
        <span className="text-muted-foreground">{labels.backOffice}</span>
        <ChevronRight className="size-4 text-muted-foreground" />
        <span className="truncate font-medium text-foreground">{pageTitle}</span>
      </div>

      <div className="relative hidden flex-1 sm:block sm:max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={labels.adminSearchPlaceholder}
          className="h-9 rounded-md border-border/70 bg-card/70 pl-9 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground xl:flex">
          <CircleDot className="size-3 fill-emerald-400 text-emerald-400" />
          <span>{labels.operational}</span>
        </div>
        <Button variant="ghost" size="icon" className="size-9 text-foreground">
          <Moon className="size-4" />
          <span className="sr-only">{labels.theme}</span>
        </Button>
        <Button variant="ghost" size="icon" className="relative size-9 text-foreground">
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500" />
          <span className="sr-only">{labels.notifications}</span>
        </Button>
        <Avatar className="size-8">
          <AvatarFallback className="rounded-full bg-muted text-xs text-foreground">
            K
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
