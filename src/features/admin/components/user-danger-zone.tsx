'use client';

import { AlertTriangle, Loader2, RotateCcw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';

import { restoreUserAction, softDeleteUserAction } from '../actions/user-admin.action';

interface UserDangerZoneProps {
  deletedAt: string | null;
  userId: string;
  usersListHref: string;
}

export function UserDangerZone({ deletedAt, userId, usersListHref }: UserDangerZoneProps) {
  const router = useRouter();
  const { pending, refresh, run } = useAdminMutation();
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isDeleted, setIsDeleted] = useState(Boolean(deletedAt));
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsDeleted(Boolean(deletedAt));
  }, [deletedAt]);

  async function handleAction() {
    if (!isDeleted && !confirming) {
      setConfirming(true);
      setMessage(null);
      setError(null);
      return;
    }

    setMessage(null);
    setError(null);

    const result = await run(() =>
      isDeleted ? restoreUserAction({ userId }) : softDeleteUserAction({ userId }),
    );

    if (!result.ok) {
      setError(result.error);
      setConfirming(false);
      return;
    }

    setConfirming(false);

    if (isDeleted) {
      setIsDeleted(false);
      setMessage('User restored successfully.');
      refresh();
      return;
    }

    router.push(usersListHref);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-ds-radius-lg border border-ds-error/30 bg-ds-error/5 p-ds-space-4">
        <div className="flex items-start gap-3">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ds-error" />
          <div className="space-y-1">
            <p className="text-ds-text-sm font-semibold text-ds-text">
              {isDeleted ? 'This user is currently soft-deleted' : 'Delete this user'}
            </p>
            <p className="text-ds-text-sm text-ds-text-muted">
              {isDeleted
                ? 'The user account is marked as deleted and inactive. You can restore it to reactivate the account.'
                : 'Soft-deleting will mark the user as inactive and remove them from the users list. This action can be reversed from their profile.'}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          {isDeleted ? (
            <Button
              disabled={pending}
              onClick={() => {
                void handleAction();
              }}
              variant="outline"
            >
              {pending ? (
                <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" />
              ) : (
                <RotateCcw aria-hidden="true" className="mr-2 size-4" />
              )}
              Restore user
            </Button>
          ) : confirming ? (
            <>
              <Button
                disabled={pending}
                onClick={() => {
                  void handleAction();
                }}
                variant="destructive"
              >
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
            <Button
              disabled={pending}
              onClick={() => {
                void handleAction();
              }}
              variant="destructive"
            >
              <Trash2 aria-hidden="true" className="mr-2 size-4" />
              Soft delete user
            </Button>
          )}
        </div>
      </div>

      {message ? (
        <p className="text-ds-text-sm text-emerald-600" role="status">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="text-ds-text-sm text-ds-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
