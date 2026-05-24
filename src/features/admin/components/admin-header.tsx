'use client';

import { Bell, ChevronRight, Search } from 'lucide-react';
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
    <header className="flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-4 sm:px-8">
      <div className="flex items-center gap-2 text-sm text-muted-foreground max-lg:hidden">
        <span>Admin</span>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">{pageTitle}</span>
      </div>

      <div className="relative hidden sm:block sm:w-60 md:w-72 lg:w-80">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search anything..."
          className="h-9 border-0 bg-card pl-9 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="icon" className="relative text-foreground sm:flex">
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#ff6467]" />
        </Button>
        <Avatar className="size-8">
          <AvatarFallback className="bg-muted text-xs text-muted-foreground">K</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
