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
  Search,
  Shield,
  Tags,
  Users,
  X,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  navMemberships: Users,
  navCatalog: Tags,
  navAudit: ClipboardList,
  navRoles: Shield,
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
  '/admin/memberships': 'navMemberships',
  '/admin/catalog': 'navCatalog',
  '/admin/audit': 'navAudit',
  '/admin/roles': 'navRoles',
};

interface AdminMobileNavProps {
  locale: SupportedLocale;
  labels: AdminNavLabels & {
    adminRole: string;
    adminSearchPlaceholder: string;
    closeMenu: string;
    openMenu: string;
    title: string;
  };
  visibleKeys?: AdminNavKey[];
}

export function AdminMobileNav({ locale, labels, visibleKeys }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  const items = visibleKeys
    ? ADMIN_NAV_ITEMS.filter((item) => visibleKeys.includes(item.key))
    : ADMIN_NAV_ITEMS;

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-11 min-w-11 items-center justify-center text-foreground"
          aria-label={labels.openMenu}
        >
          <Menu className="size-5" />
        </button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-foreground">{pageTitle}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="flex min-h-11 min-w-11 items-center justify-center text-muted-foreground"
          aria-label="Toggle search"
        >
          <Search className="size-5" />
        </button>
      </header>

      {showSearch ? (
        <form
          className="flex gap-2 border-b border-border bg-background px-4 py-2 lg:hidden"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const q = (new FormData(form).get('q') as string)?.trim();
            if (q) {
              router.push(`${pathname}?q=${encodeURIComponent(q)}`);
            } else {
              router.push(pathname);
            }
            setShowSearch(false);
          }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder={labels.adminSearchPlaceholder}
              className="h-9 border-border/80 bg-background/80 pl-9 text-sm"
            />
          </div>
          <Button type="submit" className="h-9 shrink-0" size="sm">
            Search
          </Button>
        </form>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />
      ) : null}

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
            <span className="font-semibold text-sidebar-foreground">{labels.title}</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex min-h-9 min-w-9 items-center justify-center text-sidebar-foreground"
            aria-label={labels.closeMenu}
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4">
          {items.map((item) => {
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
      </aside>
    </>
  );
}
