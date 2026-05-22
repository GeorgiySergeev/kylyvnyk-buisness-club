'use client';

import { useTransition } from 'react';

import { Loader2 } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';

import { Button } from '@/components/ui/button';

interface SignOutPanelProps {
  redirectUrl: string;
  submitLabel: string;
}

export function SignOutPanel({ redirectUrl, submitLabel }: SignOutPanelProps) {
  const { signOut } = useClerk();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={pending}
      className="min-h-11"
      onClick={() => {
        startTransition(async () => {
          await signOut({ redirectUrl });
        });
      }}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {submitLabel}
    </Button>
  );
}
