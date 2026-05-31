'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { type AuthAction, type NavItem } from '@/components/layout/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { LocaleSwitcher } from './locale-switcher';

interface HomeHeaderProps {
  avatarUrl?: string;
  displayName?: string;
  guestAuth: {
    joinNow: AuthAction;
    signIn: AuthAction;
  };
  homeHref: string;
  isAuthenticated: boolean;
  memberAuth: {
    signOut: AuthAction;
  };
  navItems: NavItem[];
}

function getInitials(value?: string) {
  if (!value) return 'KC';
  const parts = value.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'KC';
}

const navLinkClass =
  'inline-flex min-h-11 items-center rounded-ds-radius-md px-ds-space-3 text-ds-text-sm transition-ds-transition-fast focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none';

export function HomeHeader({
  avatarUrl,
  displayName,
  guestAuth,
  homeHref,
  isAuthenticated,
  memberAuth,
  navItems,
}: HomeHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === homeHref;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-ds-border bg-ds-bg/90 backdrop-blur-md">
      <div className="kc-container">
        <div className="grid min-h-14 grid-cols-[1fr_auto_1fr] items-center py-2">
          <Link
            className="group flex min-h-11 items-center gap-3 rounded-ds-radius-md px-1 focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
            href={homeHref}
          >
            <div className="flex flex-col leading-none">
              <span className="font-sans text-ds-text-sm font-semibold tracking-[0.18em] text-ds-text">
                KYLYVNYK
              </span>
              <span className="mt-1 text-ds-text-xs uppercase tracking-[0.2em] text-ds-text-faint">
                Business Club
              </span>
            </div>
          </Link>

          <nav aria-label="Primary navigation" className="hidden md:block">
            {isHome && !isAuthenticated ? null : (
              <ul className="flex items-center gap-1">
                <li className="list-none">
                  <Link
                    className={cn(
                      navLinkClass,
                      pathname === homeHref
                        ? 'font-medium text-ds-text'
                        : 'text-ds-text-muted hover:text-ds-text',
                    )}
                    href={homeHref}
                  >
                    Home
                  </Link>
                </li>
                {navItems.map((item) => (
                  <li key={item.href} className="list-none">
                    <Link
                      className={cn(
                        navLinkClass,
                        isActive(item.href, item.exact)
                          ? 'font-medium text-white'
                          : 'text-fg/50 hover:text-white',
                      )}
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </nav>

          <div className="flex items-center justify-end gap-3">
            <div className="hidden md:block">
              <LocaleSwitcher />
            </div>

            <div className="hidden items-center gap-3 md:flex">
              {isAuthenticated ? (
                <>
                  <Avatar className="size-9 rounded-ds-radius-md border border-ds-border">
                    <AvatarImage alt="" src={avatarUrl} />
                    <AvatarFallback className="rounded-ds-radius-md bg-transparent text-ds-text-xs font-semibold text-ds-text-muted">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  {/* <Link
                    className="inline-flex min-h-11 items-center px-ds-space-2 text-ds-text-sm text-ds-text-muted transition-ds-transition-fast hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
                    href={memberAuth.signOut.href}
                  >
                    {memberAuth.signOut.label}
                  </Link> */}
                </>
              ) : (
                <Link
                  className="inline-flex min-h-11 items-center px-ds-space-2 text-ds-text-sm font-medium text-ds-text transition-ds-transition-fast hover:text-ds-text-muted focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
                  href={guestAuth.signIn.href}
                >
                  {guestAuth.signIn.label}
                </Link>
              )}
            </div>

            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label="Toggle menu"
                    className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-ds-radius-md text-ds-text-muted transition-ds-transition-fast hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none"
                    type="button"
                  >
                    <Menu aria-hidden="true" className="size-5" strokeWidth={1.5} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="mt-2 w-72 rounded-ds-radius-md border border-ds-border bg-ds-bg/95 p-ds-space-3 shadow-none backdrop-blur-md"
                >
                  <div className="mb-2 flex justify-end">
                    <LocaleSwitcher />
                  </div>
                  <div className="flex flex-col gap-1">
                    {isHome && !isAuthenticated ? null : (
                      <DropdownMenuItem
                        className={cn(
                          navLinkClass,
                          'w-full cursor-pointer',
                          pathname === homeHref
                            ? 'font-medium text-ds-text'
                            : 'text-ds-text-muted hover:text-ds-text',
                        )}
                        onSelect={() => router.push(homeHref)}
                      >
                        Home
                      </DropdownMenuItem>
                    )}
                    {navItems.map((item) => (
                      <DropdownMenuItem
                        key={item.href}
                        className={cn(
                          navLinkClass,
                          'w-full cursor-pointer',
                          isActive(item.href, item.exact)
                            ? 'font-medium text-ds-text'
                            : 'text-ds-text-muted hover:text-ds-text',
                        )}
                        onSelect={() => router.push(item.href)}
                      >
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </div>
                  <div className="my-3 border-t border-ds-border" />
                  {isAuthenticated ? (
                    <div className="flex items-center justify-between gap-2 px-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar className="size-8 rounded-ds-radius-md border border-ds-border">
                          <AvatarImage alt="" src={avatarUrl} />
                          <AvatarFallback className="rounded-ds-radius-md bg-transparent text-ds-text-xs font-semibold text-ds-text-muted">
                            {getInitials(displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="max-w-[120px] truncate text-ds-text-xs font-medium text-ds-text-muted">
                          {displayName || 'Member'}
                        </span>
                      </div>
                      <DropdownMenuItem
                        className="rounded-ds-radius-md px-2.5 py-1.5 text-ds-text-xs font-medium text-ds-text-muted outline-none transition-ds-transition-fast hover:text-ds-text focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:outline-none cursor-pointer"
                        onSelect={() => router.push(memberAuth.signOut.href)}
                      >
                        {memberAuth.signOut.label}
                      </DropdownMenuItem>
                    </div>
                  ) : (
                    <DropdownMenuItem
                      className={cn(navLinkClass, 'w-full cursor-pointer text-ds-text-muted hover:text-ds-text')}
                      onSelect={() => router.push(guestAuth.signIn.href)}
                    >
                      {guestAuth.signIn.label}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
