'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useCategoryAdmin } from './category-admin-provider';

interface CategoriesPageActionsProps {
  addCategoryLabel: string;
}

export function CategoriesPageActions({ addCategoryLabel }: CategoriesPageActionsProps) {
  const { openCreate } = useCategoryAdmin();

  return (
    <Button
      className="h-9 gap-2 bg-foreground text-background hover:bg-foreground/90"
      onClick={openCreate}
      size="sm"
      type="button"
    >
      <Plus aria-hidden="true" className="size-4" />
      <span className="hidden sm:inline">{addCategoryLabel}</span>
    </Button>
  );
}
