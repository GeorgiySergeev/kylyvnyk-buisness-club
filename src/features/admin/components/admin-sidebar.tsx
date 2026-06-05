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
  Shield,
  ShieldCheck,
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
  navAccess: ShieldCheck,
  navBusinesses: Building2,
  navIntroductions: MessageSquare,
  navCards: CreditCard,
  navCategories: Tags,
  navCountries: Globe2,
  navStripeLinks: LinkIcon,
  navSubscriptions: ReceiptText,
  navMemberships: Users,
  navCatalog: Tags,
  navAudit: ClipboardList,
  navRoles: Shield,
};

interface AdminSidebarInnerProps {
  locale: SupportedLocale;
  labels: AdminNavLabels & {
    adminBrand: string;
    adminRole: string;
    backOffice: string;
    navigation: string;
    title: string;
  };
  visibleKeys?: AdminNavKey[];
}

export function AdminSidebarInner({ locale, labels, visibleKeys }: AdminSidebarInnerProps) {
  const pathname = usePathname() ?? '';
  const items = visibleKeys
    ? ADMIN_NAV_ITEMS.filter((item) => visibleKeys.includes(item.key))
    : ADMIN_NAV_ITEMS;

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-5">
        <div className="flex size-8 items-center justify-center rounded-ds-radius-md border border-ds-brand-subtle bg-ds-brand-subtle text-ds-text-xs font-bold uppercase text-ds-brand">
          K
        </div>
        <div className="min-w-0">
          <div className="text-ds-text-sm font-semibold text-ds-text">{labels.adminBrand}</div>
          <div className="text-ds-text-xs text-ds-text-muted">{labels.backOffice}</div>
        </div>
      </div>

      <div className="px-4 pb-2 text-ds-text-xs uppercase tracking-[0.08em] font-medium text-ds-text-muted">
        {labels.navigation}
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {items.map((item) => {
          const Icon = ADMIN_NAV_ICONS[item.key];
          const href = localizeHref(locale, item.href);
          const active = pathname === href || (item.href !== '/admin' && pathname.startsWith(href));

          return (
            <Link
              key={item.href}
              className={cn(
                'flex h-9 items-center gap-2 rounded-ds-radius-md px-ds-space-3 text-ds-text-sm font-medium text-ds-text-muted transition-ds-transition-fast hover:bg-ds-surface-2',
                active && 'bg-ds-accent-subtle text-ds-accent',
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
            <AvatarFallback className="rounded-full bg-sidebar-accent text-xs text-sidebar-accent-foreground">
              A
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-sidebar-foreground">{labels.title}</span>
            <span className="text-[11px] text-sidebar-foreground/60">{labels.adminRole}</span>
          </div>
        </div>
      </div>
    </>
  );
}
