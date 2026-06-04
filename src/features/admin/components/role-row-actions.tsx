'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';
import { deleteRoleAction } from '@/features/roles/actions';

import { AdminRowActions, type RowAction } from './admin-row-actions';

interface RoleRowActionsProps {
  actionLabel: string;
  deleteLabel: string;
  editLabel: string;
  roleId: string;
  isSystem: boolean;
  viewHref: string;
  viewLabel: string;
}

export function RoleRowActions({
  actionLabel,
  deleteLabel,
  editLabel,
  roleId,
  isSystem,
  viewHref,
  viewLabel,
}: RoleRowActionsProps) {
  const router = useRouter();
  const { pending, run } = useAdminMutation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async () => {
    const result = await run(() => deleteRoleAction({ id: roleId }));
    if (result.ok) {
      setDialogOpen(false);
      router.refresh();
    }
  };

  const actions: RowAction[] = [
    { label: viewLabel, href: viewHref, icon: <Eye className="size-4" /> },
    { label: editLabel, href: viewHref, icon: <Pencil className="size-4" /> },
    {
      label: deleteLabel,
      icon: <Trash2 className="size-4" />,
      destructive: true,
      disabled: isSystem,
      disabledReason: isSystem ? 'System roles cannot be deleted' : undefined,
      onClick: () => setDialogOpen(true),
    },
  ];

  return (
    <>
      <AdminRowActions actions={actions} actionLabel={actionLabel} />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{deleteLabel}</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={pending}
              onClick={() => void handleDelete()}
              variant="destructive"
            >
              {deleteLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
