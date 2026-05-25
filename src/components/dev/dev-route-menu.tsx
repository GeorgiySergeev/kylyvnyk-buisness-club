'use client';

import { Bug, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface RouteGroup {
  label: string;
  routes: { href: string; label: string }[];
}

interface DevRouteMenuProps {
  locale: string;
}

const ROUTE_GROUPS: RouteGroup[] = [
  {
    label: 'Public',
    routes: [
      { href: '/', label: 'Home' },
      { href: '/sign-in', label: 'Sign In' },
      { href: '/sign-up', label: 'Sign Up' },
      { href: '/sign-out', label: 'Sign Out' },
      { href: '/directory', label: 'Directory' },
      { href: '/verify-card', label: 'Verify Card' },
    ],
  },
  {
    label: 'Member',
    routes: [
      { href: '/m/dashboard', label: 'Dashboard' },
      { href: '/m/onboarding', label: 'Onboarding' },
      { href: '/m/introduce', label: 'Introduce' },
      { href: '/m/2fa-required', label: '2FA Required' },
    ],
  },
  {
    label: 'Admin',
    routes: [
      { href: '/admin', label: 'Admin Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/cards', label: 'Cards' },
      { href: '/admin/businesses', label: 'Businesses' },
      { href: '/admin/audit', label: 'Audit' },
    ],
  },
  {
    label: 'Legal',
    routes: [
      { href: '/legal/contact', label: 'Contact' },
      { href: '/legal/cookie', label: 'Cookie Policy' },
      { href: '/legal/privacy', label: 'Privacy Policy' },
      { href: '/legal/terms', label: 'Terms of Service' },
    ],
  },
];

export function DevRouteMenu({ locale }: DevRouteMenuProps) {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (process.env.NODE_ENV !== 'development') return null;

  const localize = (href: string) => (href === '/' ? `/${locale}` : `/${locale}${href}`);

  return (
    <div className="fixed bottom-4 right-4 z-[999]">
      {open ? (
        <div className="mb-2 max-h-[70vh] w-72 overflow-y-auto rounded-lg border border-border/50 bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Bug className="size-3.5" />
              Dev Routes
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex min-h-8 min-w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Close dev menu"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="p-2">
            {ROUTE_GROUPS.map((group) => (
              <div key={group.label} className="mb-2 last:mb-0">
                <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  {group.label}
                </p>
                {group.routes.map((route) => (
                  <Link
                    key={route.href}
                    href={localize(route.href)}
                    onClick={() => setOpen(false)}
                    className="flex min-h-9 items-center rounded-md px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary"
                  >
                    {route.label}
                    <span className="ml-auto text-[10px] text-muted-foreground">{route.href}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
        aria-label={open ? 'Close dev menu' : 'Open dev menu'}
      >
        <Bug className="size-5" />
      </button>
    </div>
  );
}
