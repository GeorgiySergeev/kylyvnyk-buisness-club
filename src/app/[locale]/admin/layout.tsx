import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { AdminHeader, type AdminShellLabels } from '@/features/admin/components/admin-header';
import { AdminMobileNav } from '@/features/admin/components/admin-mobile-nav';
import {
  ADMIN_NAV_ITEMS,
  type AdminNavKey,
  type AdminNavLabels,
} from '@/features/admin/components/admin-nav';
import { AdminSidebarInner } from '@/features/admin/components/admin-sidebar';
import { getAdminNotifications } from '@/features/admin/lib/admin-notifications';
import { guardAdmin } from '@/features/auth/lib/role-guards';
import { isSuperAdmin } from '@/lib/auth/permissions';
import { getT } from '@/lib/i18n/t-server';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

interface AdminLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const supportedLocale = locale as SupportedLocale;
  const user = await guardAdmin(supportedLocale);

  const t = getT('admin', supportedLocale);
  const userIsSuperAdmin = await isSuperAdmin(user.id);
  const notifications = await getAdminNotifications(supportedLocale);

  const navLabels = ADMIN_NAV_ITEMS.reduce<AdminNavLabels>((labels, item) => {
    labels[item.key] = t(item.key);
    return labels;
  }, {} as AdminNavLabels);

  const visibleKeys: AdminNavKey[] = ADMIN_NAV_ITEMS.filter((item) => {
    if (item.href === '/admin/access' || item.href === '/admin/roles') {
      return userIsSuperAdmin;
    }
    return true;
  }).map((item) => item.key);

  const shellLabels: AdminShellLabels = {
    ...navLabels,
    accountMenuLabel: t('accountMenuLabel'),
    adminBrand: t('adminBrand'),
    adminSearchError: t('adminSearchError'),
    adminSearchLoading: t('adminSearchLoading'),
    adminSearchMinChars: t('adminSearchMinChars'),
    adminSearchNoResults: t('adminSearchNoResults'),
    adminRole: t('adminRole'),
    adminSearchPlaceholder: t('adminSearchPlaceholder'),
    adminSearchTypeBusiness: t('adminSearchTypeBusiness'),
    adminSearchTypeCard: t('adminSearchTypeCard'),
    adminSearchTypeCategory: t('adminSearchTypeCategory'),
    adminSearchTypeIntroduction: t('adminSearchTypeIntroduction'),
    adminSearchTypeUser: t('adminSearchTypeUser'),
    adminSearchViewAll: t('adminSearchViewAll'),
    backOffice: t('backOffice'),
    goToAdminDashboard: t('goToAdminDashboard'),
    goToMemberDashboard: t('goToMemberDashboard'),
    goToProfile: t('goToProfile'),
    notifications: t('notifications'),
    notificationsEmpty: t('notificationsEmpty'),
    notificationsNeedsReview: t('notificationsNeedsReview'),
    notificationsTitle: t('notificationsTitle'),
    operational: t('operational'),
    signOut: t('signOut'),
    theme: t('theme'),
    title: t('title'),
  };

  return (
    <div className={["admin flex h-dvh overflow-hidden bg-background text-foreground", geistSans.variable, geistMono.variable].join(' ')}>
      <aside
        aria-label="Admin navigation"
        className="hidden h-full w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex"
      >
        <AdminSidebarInner
          locale={supportedLocale}
          labels={{ ...shellLabels, navigation: t('navigation') }}
          visibleKeys={visibleKeys}
        />
      </aside>

      <AdminMobileNav locale={supportedLocale} labels={shellLabels} notifications={notifications} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        <div className="max-lg:hidden">
          <AdminHeader
            labels={shellLabels}
            locale={supportedLocale}
            notifications={notifications}
          />
        </div>
        <main className="container mx-auto min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
