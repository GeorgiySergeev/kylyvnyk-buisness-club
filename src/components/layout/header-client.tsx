'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { NavigationSession } from '@/lib/auth/navigation-session';
import { cn } from '@/lib/utils';

import type { AuthAction, NavItem } from './navigation';

interface HeaderClientProps {
  homeHref: string;
  logoLabel: string;
  navItems: NavItem[];
  session: NavigationSession;
  guestAuth: {
    signIn: AuthAction;
    joinNow: AuthAction;
  };
  memberAuth: {
    signOut: AuthAction;
  };
  ariaLabels: {
    closeMenu: string;
    mobileNavigation: string;
    openMenu: string;
    primaryNavigation: string;
    userMenu: string;
  };
}

function getInitials(value?: string) {
  if (!value) {
    return 'KC';
  }

  const parts = value.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'KC';
}

export function HeaderClient({
  homeHref,
  logoLabel,
  navItems,
  session,
  guestAuth,
  memberAuth,
  ariaLabels,
}: HeaderClientProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAuthenticated = session.role !== 'guest';

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-(--kc-header-h) border-b border-border/70',
        'bg-background/90 backdrop-blur-md',
      )}
    >
      <div className="kc-container flex h-full items-center justify-between gap-4">
        <Link
          href={homeHref}
          className="flex min-h-11 items-center gap-2 rounded-md px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          onClick={() => setOpen(false)}
        >
          <span className="text-sm font-semibold tracking-[0.32em] text-primary uppercase">
            {logoLabel}
          </span>
        </Link>

        <nav
          aria-label={ariaLabels.primaryNavigation}
          className="hidden items-center gap-1 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'min-h-11 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                isActive(item.href, item.exact)
                  ? 'bg-secondary text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3">
                <Avatar className="border border-border/70">
                  <AvatarImage src={session.avatarUrl} alt="" />
                  <AvatarFallback className="bg-secondary text-xs font-semibold text-primary">
                    {getInitials(session.displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">{ariaLabels.userMenu}</span>
              </div>
              <Link
                href={memberAuth.signOut.href}
                className="min-h-11 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {memberAuth.signOut.label}
              </Link>
            </>
          ) : (
            <>
              <Link
                href={guestAuth.signIn.href}
                className="min-h-11 rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {guestAuth.signIn.label}
              </Link>
              <Link
                href={guestAuth.joinNow.href}
                className="min-h-11 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {guestAuth.joinNow.label}
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-controls="mobile-nav"
          aria-expanded={open}
          aria-label={open ? ariaLabels.closeMenu : ariaLabels.openMenu}
          onClick={() => setOpen((current) => !current)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label={ariaLabels.mobileNavigation}
          className="border-t border-border/70 bg-card shadow-xl md:hidden"
        >
          <div className="kc-container flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'min-h-11 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                  isActive(item.href, item.exact)
                    ? 'bg-secondary text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}

            <hr className="kc-gold-rule my-3" />

            {isAuthenticated ? (
              <Link
                href={memberAuth.signOut.href}
                onClick={() => setOpen(false)}
                className="min-h-11 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {memberAuth.signOut.label}
              </Link>
            ) : (
              <>
                <Link
                  href={guestAuth.signIn.href}
                  onClick={() => setOpen(false)}
                  className="min-h-11 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {guestAuth.signIn.label}
                </Link>
                <Link
                  href={guestAuth.joinNow.href}
                  onClick={() => setOpen(false)}
                  className="mt-1 min-h-11 rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {guestAuth.joinNow.label}
                </Link>
              </>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
