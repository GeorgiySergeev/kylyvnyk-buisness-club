import type { ReactNode } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { AdminHeader, type AdminShellLabels } from '@/features/admin/components/admin-header';
import { AdminMobileNav } from '@/features/admin/components/admin-mobile-nav';
import { ADMIN_NAV_ITEMS, type AdminNavLabels } from '@/features/admin/components/admin-nav';
import { AdminSidebarInner } from '@/features/admin/components/admin-sidebar';
import { guardAdmin } from '@/features/auth/lib/role-guards';
import { getT } from '@/lib/i18n/t-server';

interface AdminLayoutProps {
  children: ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const supportedLocale = locale as SupportedLocale;
  await guardAdmin(supportedLocale);

  const t = getT('admin', supportedLocale);
  const navLabels = ADMIN_NAV_ITEMS.reduce<AdminNavLabels>((labels, item) => {
    labels[item.key] = t(item.key);
    return labels;
  }, {} as AdminNavLabels);
  const shellLabels: AdminShellLabels = {
    ...navLabels,
    adminBrand: t('adminBrand'),
    adminRole: t('adminRole'),
    adminSearchPlaceholder: t('adminSearchPlaceholder'),
    backOffice: t('backOffice'),
    notifications: t('notifications'),
    operational: t('operational'),
    theme: t('theme'),
    title: t('title'),
  };
  const mobileLabels = {
    ...shellLabels,
    closeMenu: t('closeMenu'),
    openMenu: t('openMenu'),
  };

  return (
    <div className="admin flex min-h-[calc(100dvh-4rem)] bg-background text-foreground">
      <aside className="sticky top-0 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <AdminSidebarInner locale={supportedLocale} labels={{ ...shellLabels, navigation: t('navigation') }} />
      </aside>

      <AdminMobileNav locale={supportedLocale} labels={mobileLabels} />

      <div className="flex flex-1 flex-col bg-background">
        <div className="max-lg:hidden">
          <AdminHeader labels={shellLabels} />
        </div>
        <main className="flex-1 overflow-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}
