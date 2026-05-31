export function MemberDashboardSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse space-y-8">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-full bg-ds-surface-2" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-ds-surface-2" />
            <div className="h-3 w-24 rounded bg-ds-surface-2/70" />
          </div>
        </div>
        <div className="flex gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-4 w-20 rounded bg-ds-surface-2/70" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-7 w-40 rounded bg-ds-surface-2" />
        <div className="h-4 w-full max-w-md rounded bg-ds-surface-2/70" />
        <div className="h-48 rounded bg-ds-surface-2/40" />
      </div>
    </div>
  );
}
