export const ACTIVE_BUSINESS_STATUSES = ['UNDER_REVIEW', 'PUBLISHED', 'HIDDEN'] as const;

export type ActiveBusinessStatus = (typeof ACTIVE_BUSINESS_STATUSES)[number];

export function normalizeBusinessStatus(status: string): ActiveBusinessStatus {
  if (status === 'PUBLISHED' || status === 'HIDDEN') {
    return status;
  }

  if (status === 'DECLINED') {
    return 'HIDDEN';
  }

  return 'UNDER_REVIEW';
}

export function isActiveBusinessStatus(status: string): status is ActiveBusinessStatus {
  return ACTIVE_BUSINESS_STATUSES.includes(status as ActiveBusinessStatus);
}
