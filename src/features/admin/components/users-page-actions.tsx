'use client';

import { Download, Plus } from 'lucide-react';
import Link from 'next/link';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';

import { UsersImportDialog, type UsersImportLabels } from './users-import-dialog';

interface UsersPageActionsProps {
  addUserLabel: string;
  exportLabel: string;
  importLabels: UsersImportLabels;
  locale: SupportedLocale;
  planFilter: string;
  searchTerm: string;
  statusFilter: string;
}

export function UsersPageActions({
  addUserLabel,
  exportLabel,
  importLabels,
  locale,
  planFilter,
  searchTerm,
  statusFilter,
}: UsersPageActionsProps) {
  const exportParams = new URLSearchParams();

  if (searchTerm) exportParams.set('q', searchTerm);
  if (planFilter) exportParams.set('plan', planFilter);
  if (statusFilter) exportParams.set('status', statusFilter);

  const exportQuery = exportParams.toString();
  const exportHref = exportQuery
    ? `/api/admin/users/export?${exportQuery}`
    : '/api/admin/users/export';

  return (
    <>
      <UsersImportDialog labels={importLabels} />
      <Button
        variant="outline"
        size="sm"
        className="h-9 gap-2 border-0 bg-card text-foreground"
        asChild
      >
        <a download href={exportHref}>
          <Download aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">{exportLabel}</span>
        </a>
      </Button>
      <Button
        size="sm"
        className="h-9 gap-2"
        asChild
      >
        <Link href={localizeHref(locale, '/admin/users/new')}>
          <Plus aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">{addUserLabel}</span>
        </Link>
      </Button>
    </>
  );
}
