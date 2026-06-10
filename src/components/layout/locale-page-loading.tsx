export function LocalePageLoading({
  description = 'Loading page content.',
  title = 'Loading…',
}: {
  description?: string;
  title?: string;
}) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-16"
    >
      <div className="size-8 animate-spin rounded-full border-2 border-ds-border border-t-ds-accent" />
      <div className="max-w-sm text-center">
        <p className="text-sm font-medium text-ds-text">{title}</p>
        <p className="mt-1 text-xs text-ds-text-muted">{description}</p>
      </div>
    </div>
  );
}
