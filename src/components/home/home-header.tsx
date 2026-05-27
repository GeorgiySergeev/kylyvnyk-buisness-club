'use client';

import { Crown, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { type AuthAction, type NavItem } from '@/components/layout/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
                <span className="text-[9px] tracking-[3px] text-muted-foreground">
                  BUSINESS CLUB
                </span>
              </div>
            </Link>
          </div>

          <div className="navbar-end md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Toggle menu"
                  className="btn btn-ghost btn-square min-h-11 min-w-11 rounded-md text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  type="button"
                >
                  <Menu aria-hidden="true" className="size-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-72 mt-2 border border-border/70 bg-card p-3 shadow-2xl rounded-md"
              >
                <div className="mb-2 flex justify-end">
                  <LocaleSwitcher />
                </div>
                <div className="flex flex-col gap-1">
                  {isHome && !isAuthenticated ? null : (
                    <DropdownMenuItem asChild>
                      <Link
                        className={cn(
                          'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors focus:bg-primary/20 focus:text-primary outline-none',
                          pathname === homeHref
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground',
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
                          'flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors focus:bg-primary/20 focus:text-primary outline-none',
                          isActive(item.href, item.exact)
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground',
                        )}
                        href={item.href}
                      >
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
                <div className="my-3 border-t border-border/70" />
                {isAuthenticated ? (
                  <div className="flex items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8 rounded-md border border-border/70">
                        <AvatarImage src={avatarUrl} alt="" />
                        <AvatarFallback className="rounded-md bg-secondary text-[10px] font-semibold text-primary">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
                        {displayName || 'Member'}
                      </span>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link
                        href={memberAuth.signOut.href}
                        className="rounded-md text-xs text-muted-foreground hover:text-foreground focus:bg-destructive/10 focus:text-destructive px-2.5 py-1.5 font-medium outline-none transition-colors border border-transparent focus:border-destructive/25"
                      >
                        {memberAuth.signOut.label}
                      </Link>
                    </DropdownMenuItem>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <DropdownMenuItem asChild>
                      <Link
                        href={guestAuth.signIn.href}
                        className="flex w-full justify-start rounded-md px-3 py-2 text-sm text-muted-foreground focus:bg-primary/10 focus:text-primary outline-none transition-colors"
                      >
                        {guestAuth.signIn.label}
                      </Link>
                    </DropdownMenuItem>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="navbar-center hidden md:flex md:flex-none md:justify-center">
            {isHome && !isAuthenticated ? null : (
              <ul aria-label="Primary navigation" className="flex items-center gap-1  p-1">
                <li className="list-none">
                  <Link
                    className={cn(
                      'inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                      pathname === homeHref
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
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
                        'inline-flex min-h-10 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                        isActive(item.href, item.exact)
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
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
                  <AvatarFallback className="rounded-md  text-xs font-semibold ">
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
