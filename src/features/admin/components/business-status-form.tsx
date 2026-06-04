'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { updateBusinessStatusAction } from '@/features/admin/actions/business-admin.action';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';

import { AdminStatusBadge } from './admin-ui';

interface BusinessStatusFormProps {
  businessId: string;
  currentStatus: string;
}

export function BusinessStatusForm({ businessId, currentStatus }: BusinessStatusFormProps) {
  const { pending, refresh, run } = useAdminMutation();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function changeStatus(status: string) {
    setError(null);
    setSaved(false);
    const result = await run(() => updateBusinessStatusAction({ businessId, status }));

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSaved(true);
    refresh();
  }

  const statuses = ['DRAFT', 'PENDING', 'PUBLISHED', 'HIDDEN', 'DECLINED'] as const;

  return (
    <div className="space-y-3">
      <Label>Status</Label>
      <div className="flex flex-wrap gap-2">
        {statuses.map((status) => {
          const isDestructive = status === 'DECLINED';
          return (
            <Button
              key={status}
              type="button"
              variant={currentStatus === status ? (isDestructive ? 'destructive' : 'default') : 'outline'}
              size="sm"
              disabled={pending || currentStatus === status}
              onClick={() => {
                void changeStatus(status);
              }}
              className="h-8 rounded-md"
            >
              <AdminStatusBadge>{status}</AdminStatusBadge>
            </Button>
          );
        })}
      </div>

      {pending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving...
        </div>
      ) : null}
      {saved ? (
        <p className="text-sm text-ds-success" role="status">
          Status updated successfully.
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
