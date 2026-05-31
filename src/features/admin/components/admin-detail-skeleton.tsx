export function AdminDetailSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="animate-pulse flex flex-col gap-8">
      <header className="space-y-6">
        <div className="h-4 w-28 rounded bg-ds-surface-2/80" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="size-11 shrink-0 rounded-full bg-ds-surface-2" />
            <div className="min-w-0 space-y-2">
              <div className="h-4 w-36 rounded bg-ds-surface-2" />
              <div className="h-3 w-28 rounded bg-ds-surface-2/70" />
              <div className="h-3 w-40 rounded bg-ds-surface-2/60" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-44 rounded bg-ds-surface-2/70" />
            <div className="h-3 w-32 rounded bg-ds-surface-2/60" />
          </div>
        </div>

        <div className="flex gap-6 overflow-hidden">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-4 w-20 shrink-0 rounded bg-ds-surface-2/70" />
          ))}
        </div>
      </header>

      <section className="space-y-4">
        <div className="h-5 w-40 rounded bg-ds-surface-2" />
        <div className="h-4 w-full max-w-lg rounded bg-ds-surface-2/70" />
        <div className="h-56 rounded-lg bg-ds-surface-2/40" />
      </section>
    </div>
  );
}
