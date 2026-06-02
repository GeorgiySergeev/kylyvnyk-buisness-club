export type MemberDashboardTab = 'profile' | 'features' | 'introduction' | 'subscription' | 'settings';

const TAB_KEYS: MemberDashboardTab[] = ['profile', 'features', 'introduction', 'subscription', 'settings'];

export function isMemberDashboardTab(value: string | undefined | null): value is MemberDashboardTab {
  return TAB_KEYS.includes(value as MemberDashboardTab);
}
