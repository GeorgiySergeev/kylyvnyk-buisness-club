'use client';

import { Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SUPPORTED_LOCALES } from '@/components/layout/navigation';

export function LocaleSwitcher() {
  const pathname = usePathname();

  const currentLocale = SUPPORTED_LOCALES.length > 0 ? SUPPORTED_LOCALES[0] : 'en';

  const switchHref = pathname.replace(/^\/(en|ru|uk)/, `/${currentLocale}`);

  return (
    <Link
      href={switchHref}
      className="flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <Globe className="size-4" />
      <span className="text-xs leading-4 uppercase">{currentLocale}</span>
    </Link>
  );
}
