export function LocalePageLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-ds-border border-t-ds-accent" />
    </div>
  );
}
