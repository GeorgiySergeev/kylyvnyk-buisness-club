'use client';

import { Crown, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { type AuthAction, type NavItem } from '@/components/layout/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { LocaleSwitcher } from './locale-switcher';

interface HomeHeaderProps {
  homeHref: string;
  navItems: NavItem[];
  isAuthenticated: boolean;
  displayName?: string;
  avatarUrl?: string;
  guestAuth: {
    signIn: AuthAction;
    joinNow: AuthAction;
  };
  memberAuth: {
    signOut: AuthAction;
  };
}

function getInitials(value?: string) {
  if (!value) return 'KC';
  const parts = value.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'KC';
}

export function HomeHeader({
  homeHref,
  navItems,
  isAuthenticated,
  displayName,
  avatarUrl,
  guestAuth,
  memberAuth,
}: HomeHeaderProps) {
  const pathname = usePathname();
  const isHome = pathname === homeHref;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-md">
      <div className="kc-container">
        <div className="navbar min-h-14 px-0 py-2">
          <div className="navbar-start">
            <Link
              className="group flex min-h-11 items-center gap-2 rounded-md px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={homeHref}
            >
              <div className="flex size-9 items-center justify-center rounded-md border border-primary/40 bg-primary/10 transition-colors group-hover:border-primary/70">
                <Crown aria-hidden="true" className="size-4 text-primary" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-sm tracking-[3px] text-primary">KYLYVNYK</span>
                <span className="text-[9px] tracking-[3px] text-muted-foreground">BUSINESS CLUB</span>
              </div>
            </Link>
          </div>

          <div className="navbar-end md:hidden">
            <div className="dropdown dropdown-end">
              <button
                aria-label="Toggle menu"
                className="btn btn-ghost btn-square min-h-11 min-w-11 rounded-md"
                tabIndex={0}
                type="button"
              >
                <Menu aria-hidden="true" className="size-5" />
              </button>
              <div className="dropdown-content z-50 mt-2 w-72 rounded-md border border-border/70 bg-card p-3 shadow-2xl">
                <div className="mb-2 flex justify-end">
                  <LocaleSwitcher />
                </div>
                <ul className="menu gap-1 rounded-md p-0">
                  {isHome && !isAuthenticated ? null : (
                    <li>
                      <Link
                        className={cn(
                          'rounded-md',
                          pathname === homeHref ? 'active bg-primary/20 text-primary' : 'text-muted-foreground',
                        )}
                        href={homeHref}
                      >
                        Home
                      </Link>
                    </li>
                  )}
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        className={cn(
                          'rounded-md',
                          isActive(item.href, item.exact)
                            ? 'active bg-primary/20 text-primary'
                            : 'text-muted-foreground',
                        )}
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="my-3 border-t border-border/70" />
                {isAuthenticated ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8 rounded-md border border-border/70">
                        <AvatarImage src={avatarUrl} alt="" />
                        <AvatarFallback className="rounded-md bg-secondary text-[10px] font-semibold text-primary">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{displayName || 'Member'}</span>
                    </div>
                    <Button asChild className="btn-ghost rounded-md text-muted-foreground">
                      <Link href={memberAuth.signOut.href}>{memberAuth.signOut.label}</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild className="btn-ghost justify-start rounded-md text-muted-foreground">
                      <Link href={guestAuth.signIn.href}>{guestAuth.signIn.label}</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="navbar-center hidden md:flex md:flex-1 md:justify-center">
            {isHome && !isAuthenticated ? null : (
              <ul
                aria-label="Primary navigation"
                className="menu menu-horizontal gap-1 rounded-md border border-border/70 bg-card/70 p-1"
              >
                <li>
                  <Link
                    className={cn(
                      'rounded-md',
                      pathname === homeHref ? 'active bg-primary/20 text-primary' : 'text-muted-foreground',
                    )}
                    href={homeHref}
                  >
                    Home
                  </Link>
                </li>
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      className={cn(
                        'rounded-md',
                        isActive(item.href, item.exact)
                          ? 'active bg-primary/20 text-primary'
                          : 'text-muted-foreground',
                      )}
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="navbar-end hidden gap-2 md:flex">
            <LocaleSwitcher />
            {isAuthenticated ? (
              <>
                <Avatar className="size-9 rounded-md border border-border/70">
                  <AvatarImage src={avatarUrl} alt="" />
                  <AvatarFallback className="rounded-md bg-secondary text-xs font-semibold text-primary">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <Button asChild className="btn-ghost rounded-md text-muted-foreground">
                  <Link href={memberAuth.signOut.href}>{memberAuth.signOut.label}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="btn-ghost rounded-md text-foreground">
                  <Link href={guestAuth.signIn.href}>{guestAuth.signIn.label}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
