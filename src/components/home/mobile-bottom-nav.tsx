'use client';

// BLOCK: Mobile bottom navigation — visible on small screens. Core UI; ensure accessibility and do not render dev-only items here.
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
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ds-border bg-ds-surface/95 backdrop-blur-sm md:hidden kc-safe-inline"
    >
      <div className="flex items-center justify-around px-ds-space-4 py-ds-space-2">
        {NAV_ITEMS.map(({ key, href, Icon }) => {
          const localizedHref = localizeHref(locale, href);
          const isActive = pathname === localizedHref || pathname.startsWith(`${localizedHref}/`);
          return (
            <Link
              key={key}
              href={localizedHref}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex min-h-11 flex-col items-center gap-0.5 rounded-ds-radius-md px-ds-space-4 py-1.5',
                'transition-all duration-150 active:scale-95',
                'focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none',
                isActive ? 'text-ds-brand' : 'text-ds-text-muted hover:text-ds-text',
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-[10px]">{labels[key]}</span>
              {/* Gold underline active indicator */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ds-brand"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
