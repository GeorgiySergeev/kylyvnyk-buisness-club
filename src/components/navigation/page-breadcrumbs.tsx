import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { getT } from '@/lib/i18n/t-server';

import { type BreadcrumbItem, Breadcrumbs } from './breadcrumbs';

interface PageBreadcrumbsProps {
  className?: string;
  currentLabel: string;
  locale: SupportedLocale;
  parents?: BreadcrumbItem[];
}

export function PageBreadcrumbs({
  className,
  currentLabel,
  locale,
  parents = [],
}: PageBreadcrumbsProps) {
  const tNav = getT('nav', locale);
  const tA11y = getT('a11y', locale);

  return (
    <Breadcrumbs
      ariaLabel={tA11y('breadcrumb')}
      className={className}
      items={[
        { label: tNav('home'), href: localizeHref(locale, '/') },
        ...parents,
        { label: currentLabel },
      ]}
    />
  );
}
