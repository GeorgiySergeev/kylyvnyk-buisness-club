import type { ReactNode } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { AdminMobileNav } from '@/features/admin/components/admin-mobile-nav';
import { AdminHeader } from '@/features/admin/components/admin-header';
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

  const t = getT('admin');

  return (
    <div className="admin flex min-h-[calc(100dvh-4rem)]">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
        <AdminSidebarInner locale={supportedLocale} t={t} />
      </aside>

      {/* Mobile nav (header + drawer) */}
      <AdminMobileNav />

      <div className="flex flex-1 flex-col bg-background">
        {/* Desktop header */}
        <div className="max-lg:hidden">
          <AdminHeader />
        </div>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
