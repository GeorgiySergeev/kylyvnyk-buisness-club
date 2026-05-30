export const VIP_PLAN_CODE = 'VIP' as const;
export const BUSINESS_PLAN_CODE = 'BUSINESS' as const;

export type MembershipPlanCode = typeof VIP_PLAN_CODE | typeof BUSINESS_PLAN_CODE;
