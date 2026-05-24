'use client';

import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import { updateUserRoleAction, updateUserStatusAction } from '../actions/user-admin.action';

interface UserRoleFormProps {
  userId: string;
  currentRole: string;
  currentStatus?: string;
}

const ROLE_OPTIONS = [
  { value: 'FREE', label: 'Free' },
  { value: 'VIP', label: 'VIP' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'ADMIN', label: 'Admin' },
] as const;

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'BANNED', label: 'Banned' },
] as const;

export function UserRoleForm({ userId, currentRole, currentStatus }: UserRoleFormProps) {
  const router = useRouter();
  const [rolePending, startRoleTransition] = useTransition();
  const [statusPending, startStatusTransition] = useTransition();

  function changeRole(role: string) {
    if (role === currentRole) return;
    startRoleTransition(async () => {
      const result = await updateUserRoleAction({ userId, role });
      if (result.ok) router.refresh();
    });
  }

  function changeStatus(status: string) {
    if (status === currentStatus) return;
    startStatusTransition(async () => {
      const result = await updateUserStatusAction({ userId, status });
      if (result.ok) router.refresh();
    });
  }

  const pending = rolePending || statusPending;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-foreground">Role</Label>
        <div className="relative flex flex-wrap gap-2">
          {ROLE_OPTIONS.map(({ value, label }) => {
            const isActive = currentRole === value;
            return (
              <Button
                key={value}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                disabled={pending || isActive}
                onClick={() => changeRole(value)}
                className={isActive ? '' : 'text-muted-foreground hover:text-foreground'}
              >
                {isActive && (
                  <span className="mr-1.5 flex size-3.5 items-center justify-center">
                    <Check className="size-3.5" />
                  </span>
                )}
                {label}
              </Button>
            );
          })}
          {rolePending && (
            <div className="absolute -bottom-5 flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Saving...</span>
            </div>
          )}
        </div>
      </div>

      {currentStatus ? (
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">Status</Label>
          <div className="relative flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(({ value, label }) => {
              const isActive = currentStatus === value;
              return (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending || isActive}
                  onClick={() => changeStatus(value)}
                  className={
                    isActive
                      ? value === 'ACTIVE'
                        ? 'border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-500 hover:text-white'
                        : value === 'BANNED'
                          ? 'border-red-700 bg-red-600 text-white hover:bg-red-500 hover:text-white'
                          : 'border-amber-700 bg-amber-600 text-white hover:bg-amber-500 hover:text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }
                >
                  {isActive && (
                    <span className="mr-1.5 flex size-3.5 items-center justify-center">
                      <Check className="size-3.5" />
                    </span>
                  )}
                  {label}
                </Button>
              );
            })}
            {statusPending && (
              <div className="absolute -bottom-5 flex items-center gap-1.5">
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Saving...</span>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
