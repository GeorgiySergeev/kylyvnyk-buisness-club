import {
  BUSINESS_PLAN_CODE,
  FREE_PLAN_CODE,
  type MembershipTierCode,
  VIP_PLAN_CODE,
} from '@/features/billing/lib/plan-codes';

export type MembershipAccessRow = {
  createdAt?: Date;
  endsAt?: Date | null;
  planCode: string;
  startsAt?: Date;
  status: string;
  updatedAt?: Date;
};

const ACTIVE_PRIORITY: Record<MembershipTierCode, number> = {
  [VIP_PLAN_CODE]: 3,
  [BUSINESS_PLAN_CODE]: 2,
  [FREE_PLAN_CODE]: 1,
};

function getRowTime(row: MembershipAccessRow): number {
  return (row.updatedAt ?? row.createdAt ?? row.startsAt ?? new Date(0)).getTime();
}

function getActivePriority(row: MembershipAccessRow): number {
  if (row.status !== 'ACTIVE') {
    return 0;
  }

  return ACTIVE_PRIORITY[row.planCode as MembershipTierCode] ?? 0;
}

export function resolveEffectiveMembership<T extends MembershipAccessRow>(rows: T[] | null | undefined): T | null {
  if (!rows?.length) {
    return null;
  }

  return [...rows].sort((a, b) => {
    const priorityDiff = getActivePriority(b) - getActivePriority(a);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return getRowTime(b) - getRowTime(a);
  })[0] ?? null;
}

export function hasMembershipTransitionChanged(input: {
  currentEndsAt: Date | null;
  currentStatus: string;
  nextEndsAt: Date | null;
  nextStatus: string;
}) {
  return (
    input.currentStatus !== input.nextStatus ||
    (input.currentEndsAt?.getTime() ?? null) !== (input.nextEndsAt?.getTime() ?? null)
  );
}
