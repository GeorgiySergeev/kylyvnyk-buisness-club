import { MemberDashboardSkeleton } from '@/features/member/components/member-dashboard-skeleton';

export default function MemberRouteLoading() {
  return (
    <div className="kc-container max-w-5xl pt-ds-space-10 md:pt-ds-space-16">
      <MemberDashboardSkeleton />
    </div>
  );
}
