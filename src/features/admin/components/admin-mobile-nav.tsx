'use client';

import {
  Building2,
  ClipboardList,
  CreditCard,
  Globe2,
  LayoutDashboard,
  LinkIcon,
  type LucideIcon,
  Menu,
  MessageSquare,
  ReceiptText,
  Tags,
  Users,
  X,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

const BREADCRUMB_MAP: Record<string, AdminNavKey> = {
  '/admin': 'navDashboard',
  '/admin/users': 'navUsers',
  '/admin/businesses': 'navBusinesses',
  '/admin/categories': 'navCategories',
  '/admin/cards': 'navCards',
  '/admin/countries': 'navCountries',
  '/admin/introductions': 'navIntroductions',
  '/admin/stripe-links': 'navStripeLinks',
  '/admin/subscriptions': 'navSubscriptions',
  '/admin/audit': 'navAudit',
};

interface AdminMobileNavProps {
  locale: SupportedLocale;
  labels: AdminNavLabels;
}

export function AdminMobileNav({ locale, labels }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const parts = pathname.split('/').filter(Boolean);
  const adminPath = `/${parts.slice(1, 3).join('/')}`;
  const pageTitle = BREADCRUMB_MAP[adminPath]
    ? labels[BREADCRUMB_MAP[adminPath]]
    : labels.navDashboard;

  return (
    <>
      {/* Mobile header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-11 min-w-11 items-center justify-center text-foreground"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-foreground">{pageTitle}</span>
        </div>
        <div className="size-11" /> {/* spacer */}
      </header>

      {/* Backdrop */}
      {open ? (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      ) : null}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar transition-transform duration-200 ease-in-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-[11px] font-bold uppercase text-sidebar-primary-foreground">
              K
            </div>
            <span className="font-semibold text-sidebar-foreground">Admin</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex min-h-9 min-w-9 items-center justify-center text-sidebar-foreground"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = ADMIN_NAV_ICONS[item.key];
            const href = localizeHref(locale, item.href);
            const isActive =
              pathname === href || (item.href !== '/admin' && pathname.startsWith(href));
            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className={cn(
                  'justify-start gap-2 px-3',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
                asChild
              >
                <a href={href}>
                  <Icon className="size-4" />
                  {labels[item.key]}
                </a>
              </Button>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
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
      </aside>
    </>
  );
}
