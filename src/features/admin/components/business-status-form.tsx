'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { updateBusinessStatusAction } from '../actions/business-admin.action';
import { AdminStatusBadge } from './admin-ui';

interface BusinessStatusFormProps {
  businessId: string;
  currentStatus: string;
}

export function BusinessStatusForm({ businessId, currentStatus }: BusinessStatusFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function changeStatus(status: string) {
    startTransition(async () => {
      const result = await updateBusinessStatusAction({ businessId, status });

      if (result.ok) {
        router.refresh();
      }
    });
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
              onClick={() => changeStatus(status)}
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
    </div>
  );
}
