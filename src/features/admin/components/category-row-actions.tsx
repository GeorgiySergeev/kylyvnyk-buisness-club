'use client';

import { Pencil, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminTableRowMenuTrigger } from '@/features/admin/components/admin-table-actions';
import type { AdminCategoryRow } from '@/features/admin/lib/categories-list';

import { useCategoryAdmin } from './category-admin-provider';

interface CategoryRowActionsProps {
  actionsLabel: string;
  deleteLabel: string;
  editLabel: string;
  row: AdminCategoryRow;
}

export function CategoryRowActions({
  actionsLabel,
  deleteLabel,
  editLabel,
  row,
}: CategoryRowActionsProps) {
  const { deleteBlockedReason, openDelete, openEdit, pending } = useCategoryAdmin();
  const blocked = deleteBlockedReason(row);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AdminTableRowMenuTrigger label={actionsLabel} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => openEdit(row)}>
          <Pencil className="size-4" />
          {editLabel}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={pending || Boolean(blocked)}
          onClick={() => openDelete(row)}
          title={blocked ?? undefined}
          variant="destructive"
        >
          <Trash2 className="size-4" />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
