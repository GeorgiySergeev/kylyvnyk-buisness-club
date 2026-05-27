'use client';

import { Check, Crown, Loader2, Shield, ShieldOff, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { updateUserRoleAction, updateUserStatusAction } from '../actions/user-admin.action';

interface UserRoleFormProps {
  currentRole: string;
  currentStatus?: string;
  userId: string;
}

const ROLE_OPTIONS = [
  { description: 'Basic membership', icon: User, value: 'FREE', label: 'Free' },
  { description: 'Premium membership', icon: Crown, value: 'VIP', label: 'VIP' },
  { description: 'Business account', icon: Shield, value: 'BUSINESS', label: 'Business' },
  { description: 'Full platform access', icon: Shield, value: 'ADMIN', label: 'Admin' },
] as const;

const STATUS_OPTIONS = [
  { color: 'emerald' as const, label: 'Active', value: 'ACTIVE' },
  { color: 'amber' as const, label: 'Inactive', value: 'INACTIVE' },
  { color: 'red' as const, label: 'Banned', value: 'BANNED' },
] as const;

const statusColorMap = {
  amber: {
    active: 'border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-amber-500/10',
    idle: 'border-border/80 text-muted-foreground hover:border-amber-500/30 hover:text-amber-300',
  },
  emerald: {
    active: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-emerald-500/10',
    idle: 'border-border/80 text-muted-foreground hover:border-emerald-500/30 hover:text-emerald-300',
  },
  red: {
    active: 'border-red-500/40 bg-red-500/10 text-red-300 shadow-red-500/10',
    idle: 'border-border/80 text-muted-foreground hover:border-red-500/30 hover:text-red-300',
  },
} as const;

export function UserRoleForm({ currentRole, currentStatus, userId }: UserRoleFormProps) {
  const router = useRouter();
  const [rolePending, startRoleTransition] = useTransition();
  const [statusPending, startStatusTransition] = useTransition();

  function changeRole(role: string) {
    if (role === currentRole) return;
    startRoleTransition(async () => {
      const result = await updateUserRoleAction({ role, userId });
      if (result.ok) router.refresh();
    });
  }

  function changeStatus(status: string) {
    if (status === currentStatus) return;
    startStatusTransition(async () => {
      const result = await updateUserStatusAction({ status, userId });
      if (result.ok) router.refresh();
    });
  }

  const pending = rolePending || statusPending;

  return (
    <div className="space-y-8">
      {/* Role section */}
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Role</h3>
          <p className="text-xs text-muted-foreground">
            Determines membership tier and feature access
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ROLE_OPTIONS.map(({ description, icon: Icon, label, value }) => {
            const isActive = currentRole === value;
            return (
              <button
                className={cn(
                  'group relative flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-center transition-all',
                  isActive
                    ? 'border-primary/50 bg-primary/10 text-primary shadow-sm shadow-primary/10'
                    : 'border-border/80 bg-background/50 text-muted-foreground hover:border-primary/30 hover:text-foreground',
                  pending && !isActive && 'pointer-events-none opacity-50',
                )}
                disabled={pending || isActive}
                key={value}
                onClick={() => changeRole(value)}
                type="button"
              >
                {isActive ? (
                  <div className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-2.5" />
                  </div>
                ) : null}
                <Icon className={cn('size-5', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                <span className="text-xs font-semibold">{label}</span>
                <span className="text-[10px] leading-tight text-muted-foreground">{description}</span>
              </button>
            );
          })}
        </div>
        {rolePending ? (
          <div className="flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground">Updating role...</span>
          </div>
        ) : null}
      </div>

      {/* Status section */}
      {currentStatus ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">Account Status</h3>
            <p className="text-xs text-muted-foreground">
              Controls whether the user can access the platform
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(({ color, label, value }) => {
              const isActive = currentStatus === value;
              const colors = statusColorMap[color];
              return (
                <Button
                  className={cn(
                    'min-w-24 gap-2 border transition-all',
                    isActive ? colors.active : colors.idle,
                  )}
                  disabled={pending || isActive}
                  key={value}
                  onClick={() => changeStatus(value)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {isActive ? (
                    <Check className="size-3.5" />
                  ) : value === 'BANNED' ? (
                    <ShieldOff className="size-3.5" />
                  ) : null}
                  {label}
                </Button>
              );
            })}
          </div>
          {statusPending ? (
            <div className="flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Updating status...</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
