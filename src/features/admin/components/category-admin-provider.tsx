'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
  useTransition,
} from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryAction,
} from '@/features/admin/actions/reference-admin.action';
import type { AdminCategoryRow } from '@/features/admin/lib/categories-list';

export interface CategoryAdminLabels {
  addCategory: string;
  cancel: string;
  categoryDeleteBlockedBusinesses: string;
  categoryDeleteBlockedChildren: string;
  categoryIcon: string;
  categoryName: string;
  categoryNoParent: string;
  categoryParent: string;
  confirmDeleteCategory: string;
  create: string;
  createCategoryDialogTitle: string;
  delete: string;
  editCategory: string;
  editCategoryDialogTitle: string;
  emptyValue: string;
  saveShort: string;
  slug: string;
  slugHint: string;
}

interface CategoryAdminContextValue {
  allRows: AdminCategoryRow[];
  deleteBlockedReason: (row: AdminCategoryRow) => string | null;
  error: string | null;
  labels: CategoryAdminLabels;
  openCreate: () => void;
  openDelete: (row: AdminCategoryRow) => void;
  openEdit: (row: AdminCategoryRow) => void;
  pending: boolean;
}

const CategoryAdminContext = createContext<CategoryAdminContextValue | null>(null);

function slugifyName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseParentId(value: unknown) {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const num = Number(raw);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function CategoryParentSelect({
  categories,
  excludeId,
  labels,
  value,
}: {
  categories: AdminCategoryRow[];
  excludeId?: number;
  labels: CategoryAdminLabels;
  value: number | null;
}) {
  const options = categories
    .filter((category) => category.id !== excludeId)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

  return (
    <select
      className="flex h-9 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      defaultValue={value ?? ''}
      name="parentId"
    >
      <option value="">{labels.categoryNoParent}</option>
      {options.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  );
}

export function CategoryAdminProvider({
  allRows,
  children,
  labels,
}: {
  allRows: AdminCategoryRow[];
  children: ReactNode;
  labels: CategoryAdminLabels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategoryRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryRow | null>(null);
  const [draftSlug, setDraftSlug] = useState('');

  const deleteBlockedReason = useCallback(
    (row: AdminCategoryRow) => {
      if (row.linkedBusinesses > 0) {
        return labels.categoryDeleteBlockedBusinesses.replace(
          '{count}',
          String(row.linkedBusinesses),
        );
      }
      if (row.childCategories > 0) {
        return labels.categoryDeleteBlockedChildren.replace('{count}', String(row.childCategories));
      }
      return null;
    },
    [labels.categoryDeleteBlockedBusinesses, labels.categoryDeleteBlockedChildren],
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    setDraftSlug('');
    setError(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((row: AdminCategoryRow) => {
    setEditing(row);
    setDraftSlug(row.slug);
    setError(null);
    setFormOpen(true);
  }, []);

  const openDelete = useCallback((row: AdminCategoryRow) => {
    setError(null);
    setDeleteTarget(row);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
    setDraftSlug('');
  }, []);

  function submitForm(formData: FormData) {
    const payload = {
      icon: String(formData.get('icon') ?? '').trim() || null,
      name: String(formData.get('name') ?? ''),
      parentId: parseParentId(formData.get('parentId')),
      slug: String(formData.get('slug') ?? ''),
    };

    startTransition(async () => {
      const result = editing
        ? await updateCategoryAction({ categoryId: editing.id, ...payload })
        : await createCategoryAction(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      closeForm();
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteCategoryAction({ categoryId: deleteTarget.id });
      if (!result.ok) {
        setError(result.error);
        setDeleteTarget(null);
        return;
      }
      setError(null);
      setDeleteTarget(null);
      router.refresh();
    });
  }

  const contextValue = useMemo(
    () => ({
      allRows,
      deleteBlockedReason,
      error,
      labels,
      openCreate,
      openDelete,
      openEdit,
      pending,
    }),
    [allRows, deleteBlockedReason, error, labels, openCreate, openDelete, openEdit, pending],
  );

  return (
    <CategoryAdminContext.Provider value={contextValue}>
      {error ? (
        <p
          className="mb-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {children}

      <Dialog onOpenChange={(open) => !open && closeForm()} open={formOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>
              {editing ? labels.editCategoryDialogTitle : labels.createCategoryDialogTitle}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editing ? labels.editCategory : labels.addCategory}
            </DialogDescription>
          </DialogHeader>
          <form action={submitForm} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">{labels.categoryName}</Label>
              <Input
                defaultValue={editing?.name ?? ''}
                id="category-name"
                name="name"
                onChange={(event) => {
                  if (!editing) setDraftSlug(slugifyName(event.target.value));
                }}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-slug">{labels.slug}</Label>
              <Input
                id="category-slug"
                key={editing ? `edit-${editing.id}` : 'create'}
                name="slug"
                onChange={(event) => setDraftSlug(event.target.value)}
                required
                {...(editing ? { defaultValue: editing.slug } : { value: draftSlug })}
              />
              <p className="text-xs text-muted-foreground">{labels.slugHint}</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-parent">{labels.categoryParent}</Label>
              <CategoryParentSelect
                categories={allRows}
                excludeId={editing?.id}
                labels={labels}
                value={editing?.parentId ?? null}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-icon">{labels.categoryIcon}</Label>
              <Input
                defaultValue={editing?.icon ?? ''}
                id="category-icon"
                maxLength={64}
                name="icon"
                placeholder={labels.emptyValue}
              />
            </div>
            {error && formOpen ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <DialogFooter className="px-0 pb-0">
              <Button disabled={pending} onClick={closeForm} type="button" variant="outline">
                {labels.cancel}
              </Button>
              <Button disabled={pending} type="submit">
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : editing ? (
                  labels.saveShort
                ) : (
                  labels.create
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={(open) => !open && setDeleteTarget(null)} open={Boolean(deleteTarget)}>
        <DialogContent className="sm:max-w-sm" showCloseButton>
          <DialogHeader>
            <DialogTitle>{labels.delete}</DialogTitle>
            <DialogDescription>
              {labels.confirmDeleteCategory}
              {deleteTarget ? (
                <span className="mt-2 block font-medium text-foreground">{deleteTarget.name}</span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button disabled={pending} onClick={() => setDeleteTarget(null)} type="button" variant="outline">
              {labels.cancel}
            </Button>
            <Button disabled={pending} onClick={confirmDelete} type="button" variant="destructive">
              {pending ? <Loader2 className="size-4 animate-spin" /> : labels.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CategoryAdminContext.Provider>
  );
}

export function useCategoryAdmin() {
  const context = useContext(CategoryAdminContext);
  if (!context) {
    throw new Error('useCategoryAdmin must be used within CategoryAdminProvider');
  }
  return context;
}
