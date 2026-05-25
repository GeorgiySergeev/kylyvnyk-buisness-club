'use client';

import { Crown, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  type AuthAction,
  type NavItem,
} from '@/components/layout/navigation';
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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="kc-container">
        <div className="navbar min-h-16 px-0 py-2">
          <div className="navbar-start gap-2">
            <div className="dropdown md:hidden">
              <button
                aria-label="Toggle navigation"
                className="btn btn-ghost btn-square min-h-11 min-w-11"
                tabIndex={0}
                type="button"
              >
                <Menu aria-hidden="true" className="size-5" />
              </button>
              <ul
                className="menu dropdown-content z-50 mt-3 w-72 rounded-box border border-border bg-card p-2 shadow-2xl"
                tabIndex={0}
              >
                {isHome && !isAuthenticated ? null : (
                  <li>
                    <Link
                      className={cn(pathname === homeHref ? 'active text-primary' : 'text-muted-foreground')}
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
                        isActive(item.href, item.exact) ? 'active text-primary' : 'text-muted-foreground',
                      )}
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="my-1 border-t border-border/70 pt-2" />
                {isAuthenticated ? (
                  <li>
                    <Link className="text-muted-foreground" href={memberAuth.signOut.href}>
                      {memberAuth.signOut.label}
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link className="text-muted-foreground" href={guestAuth.signIn.href}>
                        {guestAuth.signIn.label}
                      </Link>
                    </li>
                    <li>
                      <Link className="font-semibold text-primary" href={guestAuth.joinNow.href}>
                        {guestAuth.joinNow.label}
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
            <Link
              className="group flex min-h-11 items-center gap-2 rounded-md px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              href={homeHref}
            >
              <div className="flex size-10 items-center justify-center rounded-full border border-primary/40 bg-gradient-to-br from-primary/10 to-transparent transition-colors group-hover:border-primary/70">
                <Crown aria-hidden="true" className="size-5 text-primary" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-sm tracking-[3.6px] text-primary">KYLYVNYK</span>
                <span className="text-[10px] tracking-[4px] text-muted-foreground">BUSINESS CLUB</span>
              </div>
            </Link>
          </div>

          <div className="navbar-center hidden md:flex">
            {isHome && !isAuthenticated ? null : (
              <ul aria-label="Primary navigation" className="menu menu-horizontal gap-1 rounded-box border border-border/70 bg-card/70 p-1">
                <li>
                  <Link
                    className={cn(
                      'rounded-btn',
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
                        'rounded-btn',
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

          <div className="navbar-end gap-2">
            <LocaleSwitcher />
            {isAuthenticated ? (
              <>
                <Avatar className="size-9 border border-border/70">
                  <AvatarImage src={avatarUrl} alt="" />
                  <AvatarFallback className="bg-secondary text-xs font-semibold text-primary">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <Button asChild className="btn-ghost text-muted-foreground">
                  <Link href={memberAuth.signOut.href}>{memberAuth.signOut.label}</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="btn-outline text-foreground">
                  <Link href={guestAuth.signIn.href}>{guestAuth.signIn.label}</Link>
                </Button>
                <Button asChild className="btn-primary">
                  <Link href={guestAuth.joinNow.href}>{guestAuth.joinNow.label}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
