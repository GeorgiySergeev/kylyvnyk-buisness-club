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
        <span className="block text-[11px] font-normal uppercase tracking-[0.2em] text-fg/45 sm:text-xs">
          {eyebrow}
        </span>
        <h1
          id={titleId}
          className="font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-tight"
        >
          {title}
        </h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-fg/50 sm:text-base">{description}</p>
      </div>
    </section>
  );
}
