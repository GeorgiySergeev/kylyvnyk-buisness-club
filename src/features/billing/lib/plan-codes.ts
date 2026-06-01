export const FREE_PLAN_CODE = 'FREE' as const;
export const VIP_PLAN_CODE = 'VIP' as const;
export const BUSINESS_PLAN_CODE = 'BUSINESS' as const;

export type MembershipTierCode =
  | typeof FREE_PLAN_CODE
  | typeof VIP_PLAN_CODE
  | typeof BUSINESS_PLAN_CODE;

export type PaidMembershipPlanCode = typeof VIP_PLAN_CODE | typeof BUSINESS_PLAN_CODE;

export type MembershipPlanCode = PaidMembershipPlanCode;
