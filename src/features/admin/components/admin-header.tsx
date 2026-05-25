'use client';

import { Bell, ChevronRight, CircleDot, Moon, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const BREADCRUMB_MAP: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/businesses': 'Businesses',
  '/admin/cards': 'Cards',
  '/admin/introductions': 'Introductions',
  '/admin/audit': 'Audit Log',
};

export function AdminHeader() {
  const pathname = usePathname();

  const parts = pathname.split('/').filter(Boolean);
  const adminPath = `/${parts.slice(1, 3).join('/')}`;
  const pageTitle = BREADCRUMB_MAP[adminPath] ?? 'Admin';

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 sm:px-6">
      <div className="hidden min-w-0 items-center gap-3 text-sm max-lg:hidden lg:flex">
        <span className="font-semibold tracking-tight text-foreground">KYLYVNYK</span>
        <span className="text-muted-foreground">BackOffice</span>
        <ChevronRight className="size-4 text-muted-foreground" />
        <span className="truncate font-medium text-foreground">{pageTitle}</span>
      </div>

      <div className="relative hidden flex-1 sm:block sm:max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search admin records..."
          className="h-9 rounded-md border-border/70 bg-card/70 pl-9 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="hidden items-center gap-1.5 text-xs text-muted-foreground xl:flex">
          <CircleDot className="size-3 fill-emerald-400 text-emerald-400" />
          <span>Operational</span>
        </div>
        <Button variant="ghost" size="icon" className="size-9 text-foreground">
          <Moon className="size-4" />
          <span className="sr-only">Theme</span>
        </Button>
        <Button variant="ghost" size="icon" className="relative size-9 text-foreground">
          <Bell className="size-4" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500" />
          <span className="sr-only">Notifications</span>
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
