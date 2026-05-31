'use client';

import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { AdminCategoryRow } from '@/features/admin/lib/categories-list';

import { useCategoryAdmin } from './category-admin-provider';

interface CategoryMobileActionsProps {
  deleteLabel: string;
  editLabel: string;
  row: AdminCategoryRow;
}

export function CategoryMobileActions({ deleteLabel, editLabel, row }: CategoryMobileActionsProps) {
  const { deleteBlockedReason, openDelete, openEdit, pending } = useCategoryAdmin();
  const blocked = deleteBlockedReason(row);

  return (
    <>
      <Button className="h-9 flex-1" onClick={() => openEdit(row)} type="button" variant="outline">
        <Pencil className="mr-1.5 size-4" />
        {editLabel}
      </Button>
      <Button
        className="h-9 flex-1"
        disabled={pending || Boolean(blocked)}
        onClick={() => openDelete(row)}
        title={blocked ?? undefined}
        type="button"
        variant="destructive"
      >
        {deleteLabel}
      </Button>
    </>
  );
}
