export type MemberDashboardTab = 'profile' | 'features' | 'introduction' | 'settings';

const TAB_KEYS: MemberDashboardTab[] = ['profile', 'features', 'introduction', 'settings'];

export function isMemberDashboardTab(value: string | undefined | null): value is MemberDashboardTab {
  return TAB_KEYS.includes(value as MemberDashboardTab);
}
