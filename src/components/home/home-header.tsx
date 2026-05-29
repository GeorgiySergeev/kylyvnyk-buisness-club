'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  'inline-flex min-h-11 items-center rounded-md px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

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
  const isHome = pathname === homeHref;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-black/90 backdrop-blur-md">
      <div className="kc-container">
        <div className="grid min-h-14 grid-cols-[1fr_auto_1fr] items-center py-2">
          <Link
            className="group flex min-h-11 items-center gap-3 rounded-md px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            href={homeHref}
          >
            <div className="flex flex-col leading-none">
              <span className="font-sans text-sm font-semibold tracking-[0.18em] text-white">
                KYLYVNYK
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-fg/45">
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
                        ? 'font-medium text-white'
                        : 'text-fg/50 hover:text-white',
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
                  <Avatar className="size-9 rounded-md border border-border/50">
                    <AvatarImage alt="" src={avatarUrl} />
                    <AvatarFallback className="rounded-md bg-transparent text-xs font-semibold text-fg/60">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <Link
                    className="inline-flex min-h-11 items-center px-2 text-sm text-fg/50 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    href={memberAuth.signOut.href}
                  >
                    {memberAuth.signOut.label}
                  </Link>
                </>
              ) : (
                <Link
                  className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-white transition-colors hover:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
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
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-white/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  type="button"
                >
                  <Menu aria-hidden="true" className="size-5" strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="mt-2 w-72 rounded-md border border-border/50 bg-black/95 p-3 shadow-none backdrop-blur-md"
              >
                <div className="mb-2 flex justify-end">
                  <LocaleSwitcher />
                </div>
                <div className="flex flex-col gap-1">
                  {isHome && !isAuthenticated ? null : (
                    <DropdownMenuItem asChild>
                      <Link
                        className={cn(
                          navLinkClass,
                          'w-full',
                          pathname === homeHref ? 'font-medium text-white' : 'text-fg/50 hover:text-white',
                        )}
                        href={homeHref}
                      >
                        Home
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {navItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        className={cn(
                          navLinkClass,
                          'w-full',
                          isActive(item.href, item.exact)
                            ? 'font-medium text-white'
                            : 'text-fg/50 hover:text-white',
                        )}
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
                <div className="my-3 border-t border-border/50" />
                {isAuthenticated ? (
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="size-8 rounded-md border border-border/50">
                        <AvatarImage alt="" src={avatarUrl} />
                        <AvatarFallback className="rounded-md bg-transparent text-[10px] font-semibold text-fg/60">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="max-w-[120px] truncate text-xs font-medium text-fg/50">
                        {displayName || 'Member'}
                      </span>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link
                        className="rounded-md px-2.5 py-1.5 text-xs font-medium text-fg/50 outline-none transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        href={memberAuth.signOut.href}
                      >
                        {memberAuth.signOut.label}
                      </Link>
                    </DropdownMenuItem>
                  </div>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link
                      className={cn(navLinkClass, 'w-full text-fg/50 hover:text-white')}
                      href={guestAuth.signIn.href}
                    >
                      {guestAuth.signIn.label}
                    </Link>
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
