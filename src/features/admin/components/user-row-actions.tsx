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

import { softDeleteUserAction } from '../actions/user-admin.action';
import { AdminRowActions, type RowAction } from './admin-row-actions';

interface UserRowActionsProps {
  actionLabel: string;
  deleteLabel: string;
  editLabel: string;
  userId: string;
  viewHref: string;
  viewLabel: string;
}

export function UserRowActions({
  actionLabel,
  deleteLabel,
  editLabel,
  userId,
  viewHref,
  viewLabel,
}: UserRowActionsProps) {
  const router = useRouter();
  const { pending, run } = useAdminMutation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDelete = async () => {
    const result = await run(() => softDeleteUserAction({ userId }));
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
              This will soft-delete the user account. The user will be marked as inactive and removed from the list. This action can be reversed from their profile.
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
