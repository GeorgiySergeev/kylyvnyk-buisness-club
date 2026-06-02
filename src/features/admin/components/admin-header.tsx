'use client';

import { ChevronRight, CircleDot, Moon } from 'lucide-react';
import { usePathname } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import type { AdminNotification } from '@/features/admin/lib/admin-notifications.shared';

import { AdminAccountMenu, type AdminAccountMenuLabels } from './admin-account-menu';
import { AdminGlobalSearch, type AdminGlobalSearchLabels } from './admin-global-search';
import type { AdminNavKey, AdminNavLabels } from './admin-nav';
import {
  AdminNotificationsMenu,
  type AdminNotificationsMenuLabels,
} from './admin-notifications-menu';

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

export interface AdminShellLabels
  extends AdminNavLabels,
    AdminAccountMenuLabels,
    AdminGlobalSearchLabels,
    AdminNotificationsMenuLabels {
  adminBrand: string;
  adminSearchPlaceholder: string;
  backOffice: string;
  operational: string;
  theme: string;
  title: string;
}

interface AdminHeaderProps {
  labels: AdminShellLabels;
  locale: SupportedLocale;
  notifications: AdminNotification[];
}

export function AdminHeader({ labels, locale, notifications }: AdminHeaderProps) {
  const pathname = usePathname();

  const parts = pathname.split('/').filter(Boolean);
  const adminPath = `/${parts.slice(1, 3).join('/')}`;
  const pageTitle = BREADCRUMB_MAP[adminPath]
    ? labels[BREADCRUMB_MAP[adminPath]]
    : labels.title;

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-ds-border bg-ds-bg/95 px-ds-space-4 sm:px-ds-space-6">
      <div className="hidden min-w-0 items-center gap-3 text-ds-text-sm max-lg:hidden lg:flex">
        <span className="font-semibold tracking-tight text-ds-text">{labels.adminBrand}</span>
        <span className="text-ds-text-muted">{labels.backOffice}</span>
        <ChevronRight className="size-4 text-ds-text-muted" />
        <span className="truncate font-medium text-ds-text">{pageTitle}</span>
      </div>

      <AdminGlobalSearch
        labels={labels}
        locale={locale}
        placeholder={labels.adminSearchPlaceholder}
      />

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="hidden items-center gap-1.5 text-ds-text-xs text-ds-text-muted xl:flex">
          <CircleDot className="size-3 fill-emerald-400 text-emerald-400" />
          <span>{labels.operational}</span>
        </div>
        <Button variant="ghost" size="icon" className="size-9 text-ds-text">
          <Moon className="size-4" />
          <span className="sr-only">{labels.theme}</span>
        </Button>
        <AdminNotificationsMenu labels={labels} notifications={notifications} />
        <AdminAccountMenu labels={labels} locale={locale} />
      </div>
    </header>
  );
}
