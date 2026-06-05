'use client';

import {
  Search,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AdminNotification } from '@/features/admin/lib/admin-notifications.shared';

import { AdminAccountMenu } from './admin-account-menu';
import { type AdminNavKey, type AdminNavLabels } from './admin-nav';
import { AdminNotificationsMenu } from './admin-notifications-menu';

const BREADCRUMB_MAP: Record<string, AdminNavKey> = {
  '/admin': 'navDashboard',
  '/admin/users': 'navUsers',
  '/admin/access': 'navAccess',
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
    accountMenuLabel: string;
    adminRole: string;
    adminSearchPlaceholder: string;
    adminSearchTypeBusiness: string;
    adminSearchTypeIntroduction: string;
    goToAdminDashboard: string;
    goToMemberDashboard: string;
    goToProfile: string;
    notifications: string;
    notificationsEmpty: string;
    notificationsNeedsReview: string;
    notificationsTitle: string;
    signOut: string;
    title: string;
  };
  notifications: AdminNotification[];
}

export function AdminMobileNav({ locale, labels, notifications }: AdminMobileNavProps) {
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname() ?? '';
  const router = useRouter();

  const parts = pathname.split('/').filter(Boolean);
  const adminPath = `/${parts.slice(1, 3).join('/')}`;
  const pageTitle = BREADCRUMB_MAP[adminPath]
    ? labels[BREADCRUMB_MAP[adminPath]]
    : labels.navDashboard;

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-ds-border bg-ds-bg px-ds-space-4 lg:hidden">
        <div className="flex min-h-11 items-center gap-2 text-ds-text-sm text-ds-text-muted">
          <span className="text-ds-text">{pageTitle}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowSearch(!showSearch)}
            className="flex min-h-11 min-w-11 items-center justify-center text-ds-text-muted"
            aria-label="Toggle search"
          >
            <Search className="size-5" />
          </button>

          <AdminNotificationsMenu labels={labels} notifications={notifications} />
          <AdminAccountMenu labels={labels} locale={locale} />
        </div>
      </header>

      {showSearch ? (
        <form
          className="flex gap-2 border-b border-ds-border bg-ds-bg px-ds-space-4 py-2 lg:hidden"
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
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ds-text-muted" />
            <Input
              name="q"
              placeholder={labels.adminSearchPlaceholder}
              className="h-9 border-ds-border/80 bg-ds-bg/80 pl-9 text-ds-text-sm"
            />
          </div>
          <Button type="submit" className="h-9 shrink-0" size="sm">
            Search
          </Button>
        </form>
      ) : null}
    </>
  );
}
