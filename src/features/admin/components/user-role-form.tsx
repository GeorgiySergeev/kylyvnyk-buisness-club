'use client';

import { Check, Loader2, ShieldOff } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';
import { MEMBERSHIP_OPTIONS } from '@/features/admin/lib/access-display';
import { cn } from '@/lib/utils';

import { updateUserMembershipAction, updateUserStatusAction } from '../actions/user-admin.action';

interface UserRoleFormProps {
  currentMembershipTier?: string | null;
  currentStatus?: string;
  userId: string;
}

const MEMBERSHIP_TIERS = new Set(MEMBERSHIP_OPTIONS.map((option) => option.value));

const STATUS_OPTIONS = [
  { color: 'active' as const, label: 'Active', value: 'ACTIVE' },
  { color: 'inactive' as const, label: 'Inactive', value: 'INACTIVE' },
  { color: 'banned' as const, label: 'Banned', value: 'BANNED' },
] as const;

const statusColorMap = {
  active: {
    active: 'border-ds-success/40 bg-ds-success-subtle text-ds-success shadow-ds-success/10',
    idle: 'border-ds-border text-ds-text-muted hover:border-ds-success/30 hover:text-ds-success',
  },
  inactive: {
    active: 'border-ds-warning/40 bg-ds-warning-subtle text-ds-warning shadow-ds-warning/10',
    idle: 'border-ds-border text-ds-text-muted hover:border-ds-warning/30 hover:text-ds-warning',
  },
  banned: {
    active: 'border-ds-error/40 bg-ds-error-subtle text-ds-error shadow-ds-error/10',
    idle: 'border-ds-border text-ds-text-muted hover:border-ds-error/30 hover:text-ds-error',
  },
} as const;

type LoadingSection = 'membership' | 'status';

export function UserRoleForm({
  currentMembershipTier,
  currentStatus,
  userId,
}: UserRoleFormProps) {
  const params = useParams<{ locale?: string }>();
  const locale = (params?.locale ?? 'en') as 'en' | 'ru' | 'uk';
  const { pending, refresh, run } = useAdminMutation();
  const [membershipTier, setMembershipTier] = useState(currentMembershipTier ?? '');
  const [status, setStatus] = useState(currentStatus ?? '');
  const [loadingSection, setLoadingSection] = useState<LoadingSection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<LoadingSection | null>(null);

  useEffect(() => {
    setMembershipTier(currentMembershipTier ?? '');
  }, [currentMembershipTier]);

  useEffect(() => {
    setStatus(currentStatus ?? '');
  }, [currentStatus]);

  const selectedMembershipTier =
    membershipTier &&
    MEMBERSHIP_TIERS.has(membershipTier as (typeof MEMBERSHIP_OPTIONS)[number]['value'])
      ? membershipTier
      : undefined;

  async function changeMembership(value: string) {
    if (!value || value === selectedMembershipTier) return;
    setError(null);
    setSavedSection(null);
    setLoadingSection('membership');
    const result = await run(() =>
      updateUserMembershipAction({ membershipTier: value, userId }, locale),
    );
    setLoadingSection(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMembershipTier(value);
    setSavedSection('membership');
    refresh();
  }

  async function changeStatus(nextStatus: string) {
    if (nextStatus === status) return;
    setError(null);
    setSavedSection(null);
    setLoadingSection('status');
    const result = await run(() => updateUserStatusAction({ status: nextStatus, userId }, locale));
    setLoadingSection(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStatus(nextStatus);
    setSavedSection('status');
    refresh();
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p
          className="rounded-ds-radius-md border border-ds-error/30 bg-ds-error-subtle px-4 py-3 text-sm text-ds-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {savedSection ? (
        <p className="text-sm text-ds-success" role="status">
          Updated successfully.
        </p>
      ) : null}

      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-ds-text">Membership</h3>
          <p className="text-xs text-ds-text-muted">
            Membership tier determines billing plan and feature limits
          </p>
        </div>
        <ToggleGroup
          aria-label="Membership tier"
          className={cn(pending && 'pointer-events-none opacity-60')}
          onValueChange={(value) => {
            void changeMembership(value);
          }}
          type="single"
          value={selectedMembershipTier}
        >
          {MEMBERSHIP_OPTIONS.map(({ label, value }) => (
            <ToggleGroupItem aria-label={label} key={value} value={value}>
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {loadingSection === 'membership' ? (
          <div className="flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin text-ds-text-muted" />
            <span className="text-xs text-ds-text-muted">Updating membership...</span>
          </div>
        ) : null}
      </div>

      {status ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-ds-text">Account Status</h3>
            <p className="text-xs text-ds-text-muted">
              Controls whether the user can access the platform
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map(({ color, label, value }) => {
              const isActive = status === value;
              const colors = statusColorMap[color];
              return (
                <Button
                  className={cn(
                    'min-w-24 gap-2 border transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]',
                    isActive ? colors.active : colors.idle,
                  )}
                  disabled={pending || isActive}
                  key={value}
                  onClick={() => {
                    void changeStatus(value);
                  }}
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
          {loadingSection === 'status' ? (
            <div className="flex items-center gap-1.5">
              <Loader2 className="size-3 animate-spin text-ds-text-muted" />
              <span className="text-xs text-ds-text-muted">Updating status...</span>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
