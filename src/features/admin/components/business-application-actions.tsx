'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  approveBusinessApplicationAction,
  hideBusinessApplicationAction,
} from '@/features/admin/actions/business-admin.action';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';

interface BusinessApplicationActionsProps {
  applicationId: string;
  approveLabel: string;
  hideLabel: string;
}

export function BusinessApplicationActions({
  applicationId,
  approveLabel,
  hideLabel,
}: BusinessApplicationActionsProps) {
  const { pending, refresh, run } = useAdminMutation();
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setError(null);
    const result = await run(() => approveBusinessApplicationAction({ applicationId }));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    refresh();
  }

  async function hide() {
    setError(null);
    const result = await run(() => hideBusinessApplicationAction({ applicationId }));
    if (!result.ok) {
      setError(result.error);
      return;
    }
    refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          className="h-9 rounded-md"
          disabled={pending}
          onClick={() => {
            void approve();
          }}
        >
          {pending ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : null}
          {approveLabel}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 rounded-md"
          disabled={pending}
          onClick={() => {
            void hide();
          }}
        >
          {hideLabel}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-ds-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
