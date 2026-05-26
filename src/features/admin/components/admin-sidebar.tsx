'use client';

import {
  Building2,
  ClipboardList,
  CreditCard,
  Globe2,
  LayoutDashboard,
  LinkIcon,
  type LucideIcon,
  MessageSquare,
  ReceiptText,
  Tags,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

import { ADMIN_NAV_ITEMS, type AdminNavKey, type AdminNavLabels } from './admin-nav';

const ADMIN_NAV_ICONS: Record<AdminNavKey, LucideIcon> = {
  navDashboard: LayoutDashboard,
  navUsers: Users,
  navBusinesses: Building2,
  navIntroductions: MessageSquare,
  navCards: CreditCard,
  navCategories: Tags,
  navCountries: Globe2,
  navStripeLinks: LinkIcon,
  navSubscriptions: ReceiptText,
  navAudit: ClipboardList,
};

interface AdminSidebarInnerProps {
  locale: SupportedLocale;
  labels: AdminNavLabels;
}

export function AdminSidebarInner({ locale, labels }: AdminSidebarInnerProps) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex size-8 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-[11px] font-bold uppercase text-primary">
          K
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-sidebar-foreground">KYLYVNYK</div>
          <div className="text-[11px] text-sidebar-foreground/55">BackOffice</div>
        </div>
      </div>

      <div className="px-4 pb-2 text-[11px] font-medium text-sidebar-foreground/50">Navigation</div>
      <nav className="flex flex-col gap-1 px-3">
        {ADMIN_NAV_ITEMS.map((item) => {
          const Icon = ADMIN_NAV_ICONS[item.key];
          const href = localizeHref(locale, item.href);
          const active = pathname === href || (item.href !== '/admin' && pathname.startsWith(href));

          return (
            <Link
              key={item.href}
              className={cn(
                'flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                active && 'bg-sidebar-accent text-sidebar-accent-foreground',
              )}
              href={href}
            >
              <Icon className="size-4" />
              <span className="truncate">{labels[item.key]}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarFallback className="bg-sidebar-accent text-xs text-sidebar-accent-foreground rounded-full">
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
