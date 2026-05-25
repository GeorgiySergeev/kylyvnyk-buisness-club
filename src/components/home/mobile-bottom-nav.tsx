'use client';

import { Crown, Grid3x3, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { key: 'bottomHome', href: '/', Icon: Crown },
  { key: 'bottomDirectory', href: '/directory', Icon: Grid3x3 },
  { key: 'bottomCard', href: '/verify-card', Icon: User },
] as const;

interface MobileBottomNavProps {
  locale: SupportedLocale;
  labels: Record<string, string>;
}

export function MobileBottomNav({ locale, labels }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden">
      <div className="flex items-center justify-around px-4 py-3">
        {NAV_ITEMS.map(({ key, href, Icon }) => {
          const localizedHref = localizeHref(locale, href);
          const isActive = pathname === localizedHref;
          return (
            <Link
              key={key}
              href={localizedHref}
              className={cn(
                'flex min-h-11 flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                isActive
                  ? 'bg-secondary text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-[10px]">{labels[key]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
