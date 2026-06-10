// src/features/auth/components/auth-page-header.tsx
interface AuthPageHeaderProps {
  description: string;
  eyebrow: string;
  title: string;
  titleId?: string;
}

export function AuthPageHeader({
  description,
  eyebrow,
  title,
  titleId = 'auth-page-title',
}: AuthPageHeaderProps) {
  return (
    <section aria-labelledby={titleId} className="relative overflow-hidden pb-10 pt-2 md:pb-14">
      <div className="kc-how-it-works-bg pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative space-y-4 text-center">
        <span className="block text-ds-text-xs font-normal uppercase tracking-[0.2em] text-ds-text-faint">
          {eyebrow}
        </span>
        <h1
          id={titleId}
          className="text-ds-display-1 font-bold tracking-tight text-ds-text"
        >
          {title}
        </h1>
        <p className="mx-auto max-w-2xl text-ds-text-sm leading-relaxed text-ds-text-muted sm:text-ds-text-base">{description}</p>
      </div>
    </section>
  );
}
