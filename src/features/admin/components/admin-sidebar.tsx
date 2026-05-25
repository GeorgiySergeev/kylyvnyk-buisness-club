import {
  Building2,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Key } from '@/lib/i18n/t-server';

export const NAV_ITEMS = [
  { key: 'navDashboard' as const, href: '/admin', icon: LayoutDashboard },
  { key: 'navUsers' as const, href: '/admin/users', icon: Users },
  { key: 'navBusinesses' as const, href: '/admin/businesses', icon: Building2 },
  { key: 'navIntroductions' as const, href: '/admin/introductions', icon: MessageSquare },
  { key: 'navCards' as const, href: '/admin/cards', icon: Settings },
  { key: 'navAudit' as const, href: '/admin/audit', icon: Settings },
];

interface AdminSidebarInnerProps {
  locale: SupportedLocale;
  t: (key: Key<'admin'>) => string;
}

export function AdminSidebarInner({ locale, t }: AdminSidebarInnerProps) {
  return (
    <>
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-[11px] font-bold uppercase text-sidebar-primary-foreground">
          K
        </div>
        <span className="font-semibold text-sidebar-foreground">Admin</span>
      </div>

      <nav className="flex flex-col gap-1 px-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className="justify-start gap-2 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              asChild
            >
              <Link href={localizeHref(locale, item.href)}>
                <Icon className="size-4" />
                {t(item.key)}
              </Link>
            </Button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground">
              A
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-sidebar-foreground">Admin</span>
            <span className="text-[11px] text-sidebar-foreground/60">Super Admin</span>
          </div>
        </div>
      </div>
    </>
  );
}
