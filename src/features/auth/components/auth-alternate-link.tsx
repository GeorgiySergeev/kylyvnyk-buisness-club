// src/features/auth/components/auth-alternate-link.tsx
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface AuthAlternateLinkProps {
  href: string;
  linkLabel: string;
  prompt: string;
}

export function AuthAlternateLink({ href, linkLabel, prompt }: AuthAlternateLinkProps) {
  return (
    <p className="text-center text-sm text-fg/50">
      {prompt}{' '}
      <Link
        href={href}
        className="inline-flex min-h-11 items-center gap-1 font-medium text-white transition-colors hover:text-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {linkLabel}
        <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
      </Link>
    </p>
  );
}
