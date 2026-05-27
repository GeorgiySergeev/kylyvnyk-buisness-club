'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  restoreBusinessAction,
  softDeleteBusinessAction,
  toggleBusinessFeatureAction,
} from '@/features/admin/actions/business-admin.action';

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
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(payload: { isRecommended?: boolean; isTopPartner?: boolean }) {
    startTransition(async () => {
      const result = await toggleBusinessFeatureAction({ businessId, ...payload });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  function toggleDelete() {
    startTransition(async () => {
      const result = isDeleted
        ? await restoreBusinessAction({ businessId })
        : await softDeleteBusinessAction({ businessId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={pending}
          onClick={() => toggle({ isRecommended: !isRecommended })}
          type="button"
          variant={isRecommended ? 'default' : 'outline'}
        >
          {isRecommended ? 'Recommended: ON' : 'Recommended: OFF'}
        </Button>
        <Button
          disabled={pending}
          onClick={() => toggle({ isTopPartner: !isTopPartner })}
          type="button"
          variant={isTopPartner ? 'default' : 'outline'}
        >
          {isTopPartner ? 'Top Partner: ON' : 'Top Partner: OFF'}
        </Button>
        <Button disabled={pending} onClick={toggleDelete} type="button" variant={isDeleted ? 'outline' : 'destructive'}>
          {isDeleted ? 'Restore' : 'Soft Delete'}
        </Button>
      </div>
      {pending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Saving...</p>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
