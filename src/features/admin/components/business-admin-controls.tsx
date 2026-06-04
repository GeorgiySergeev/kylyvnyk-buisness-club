'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  restoreBusinessAction,
  softDeleteBusinessAction,
  toggleBusinessFeatureAction,
} from '@/features/admin/actions/business-admin.action';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';

interface BusinessAdminControlsProps {
  businessId: string;
  isDeleted: boolean;
  isRecommended: boolean;
  isTopPartner: boolean;
}

export function BusinessAdminControls({
  businessId,
  isDeleted,
  isRecommended,
  isTopPartner,
}: BusinessAdminControlsProps) {
  const { pending, refresh, run } = useAdminMutation();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function toggle(payload: { isRecommended?: boolean; isTopPartner?: boolean }) {
    setError(null);
    setSaved(false);
    const result = await run(() => toggleBusinessFeatureAction({ businessId, ...payload }));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    refresh();
  }

  async function toggleDelete() {
    setError(null);
    setSaved(false);
    const result = await run(() =>
      isDeleted
        ? restoreBusinessAction({ businessId })
        : softDeleteBusinessAction({ businessId }),
    );
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={pending}
          onClick={() => {
            void toggle({ isRecommended: !isRecommended });
          }}
          type="button"
          variant={isRecommended ? 'default' : 'outline'}
        >
          {isRecommended ? 'Recommended: ON' : 'Recommended: OFF'}
        </Button>
        <Button
          disabled={pending}
          onClick={() => {
            void toggle({ isTopPartner: !isTopPartner });
          }}
          type="button"
          variant={isTopPartner ? 'default' : 'outline'}
        >
          {isTopPartner ? 'Top Partner: ON' : 'Top Partner: OFF'}
        </Button>
        <Button
          disabled={pending}
          onClick={() => {
            void toggleDelete();
          }}
          type="button"
          variant={isDeleted ? 'outline' : 'destructive'}
        >
          {isDeleted ? 'Restore' : 'Soft Delete'}
        </Button>
      </div>
      {pending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Saving...
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-ds-success" role="status">
          Updated successfully.
        </p>
      ) : null}
      {error ? <p className="text-sm text-ds-error">{error}</p> : null}
    </div>
  );
}
