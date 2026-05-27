'use client';

import { AlertTriangle, Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';

import { restoreUserAction, softDeleteUserAction } from '../actions/user-admin.action';

interface UserDangerZoneProps {
  deletedAt: string | null;
  userId: string;
}

export function UserDangerZone({ deletedAt, userId }: UserDangerZoneProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const isDeleted = Boolean(deletedAt);

  function handleAction() {
    if (!isDeleted && !confirming) {
      setConfirming(true);
      return;
    }

    startTransition(async () => {
      const result = isDeleted
        ? await restoreUserAction({ userId })
        : await softDeleteUserAction({ userId });

      if (!result.ok) {
        setError(result.error);
        setConfirming(false);
        return;
      }

      setError(null);
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              {isDeleted ? 'This user is currently soft-deleted' : 'Delete this user'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isDeleted
                ? 'The user account is marked as deleted and inactive. You can restore it to reactivate the account.'
                : 'Soft-deleting will mark the user as inactive and set a deletion timestamp. This action can be reversed.'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          {isDeleted ? (
            <Button disabled={pending} onClick={handleAction} variant="outline">
              {pending ? (
                <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
              ) : (
                <RotateCcw aria-hidden="true" className="mr-2 size-4" />
              )}
              Restore user
            </Button>
          ) : confirming ? (
            <>
              <Button disabled={pending} onClick={handleAction} variant="destructive">
                {pending ? (
                  <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
                ) : (
                  <Trash2 aria-hidden="true" className="mr-2 size-4" />
                )}
                Confirm deletion
              </Button>
              <Button
                disabled={pending}
                onClick={() => setConfirming(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button disabled={pending} onClick={handleAction} variant="destructive">
              <Trash2 aria-hidden="true" className="mr-2 size-4" />
              Soft delete user
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
