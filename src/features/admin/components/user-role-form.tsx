'use client';

import { Check, Loader2, ShieldOff } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

import {
  updateUserMembershipAction,
  updateUserRoleAction,
  updateUserStatusAction,
} from '../actions/user-admin.action';

interface UserRoleFormProps {
  currentMembershipTier?: string | null;
  currentRole: string;
  currentStatus?: string;
  userId: string;
}

const ROLE_OPTIONS = [
  { value: 'GUEST', label: 'Guest' },
  { value: 'MEMBER', label: 'Member' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'OWNER', label: 'Owner' },
] as const;

const MEMBERSHIP_OPTIONS = [
  { value: 'FREE', label: 'Free' },
  { value: 'VIP', label: 'VIP' },
  { value: 'BUSINESS', label: 'Business' },
] as const;

const MEMBERSHIP_TIERS = new Set(MEMBERSHIP_OPTIONS.map((option) => option.value));
const ROLE_VALUES = new Set(ROLE_OPTIONS.map((option) => option.value));

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

export function UserRoleForm({
  currentMembershipTier,
  currentRole,
  currentStatus,
  userId,
}: UserRoleFormProps) {
  const params = useParams<{ locale?: string }>();
  const locale = (params?.locale ?? 'en') as 'en' | 'ru' | 'uk';
  const [rolePending, startRoleTransition] = useTransition();
  const [membershipPending, startMembershipTransition] = useTransition();
  const [statusPending, startStatusTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selectedRole = ROLE_VALUES.has(currentRole as (typeof ROLE_OPTIONS)[number]['value'])
    ? currentRole
    : undefined;
  const selectedMembershipTier =
    currentMembershipTier &&
    MEMBERSHIP_TIERS.has(currentMembershipTier as (typeof MEMBERSHIP_OPTIONS)[number]['value'])
      ? currentMembershipTier
      : undefined;

  function changeRole(value: string) {
    if (!value || value === selectedRole) return;
    setError(null);
    startRoleTransition(async () => {
      const result = await updateUserRoleAction({ role: value, userId }, locale);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  function changeMembership(value: string) {
    if (!value || value === selectedMembershipTier) return;
    setError(null);
    startMembershipTransition(async () => {
      const result = await updateUserMembershipAction(
        { membershipTier: value, userId },
        locale,
      );
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  function changeStatus(status: string) {
    if (status === currentStatus) return;
    setError(null);
    startStatusTransition(async () => {
      const result = await updateUserStatusAction({ status, userId }, locale);
      if (!result.ok) {
        setError(result.error);
      }
    });
  }

  const pending = rolePending || membershipPending || statusPending;

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {/* Role section */}
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Role</h3>
          <p className="text-xs text-muted-foreground">Platform access level for this user</p>
        </div>
        <ToggleGroup
          aria-label="User role"
          className={cn(pending && 'pointer-events-none opacity-60')}
          onValueChange={changeRole}
          type="single"
          value={selectedRole}
        >
          {ROLE_OPTIONS.map(({ label, value }) => (
            <ToggleGroupItem aria-label={label} key={value} value={value}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {rolePending ? (
          <div className="flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Updating role...</span>
          </div>
        ) : null}
      </div>

      {/* Membership section */}
      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">Membership</h3>
          <p className="text-xs text-muted-foreground">
            Membership tier determines billing plan and feature limits
          </p>
        </div>
        <ToggleGroup
          aria-label="Membership tier"
          className={cn(pending && 'pointer-events-none opacity-60')}
          onValueChange={changeMembership}
          type="single"
          value={selectedMembershipTier}
        >
          {MEMBERSHIP_OPTIONS.map(({ label, value }) => (
            <ToggleGroupItem aria-label={label} key={value} value={value}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {membershipPending ? (
          <div className="flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Updating membership...</span>
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
              <Loader2 className="size-3 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Updating status...</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
