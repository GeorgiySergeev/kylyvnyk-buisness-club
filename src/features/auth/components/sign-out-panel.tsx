'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { Button } from '@/components/ui/button';

import { signOutAction } from '../actions/phone-auth.action';

interface SignOutPanelProps {
  redirectUrl: string;
  submitLabel: string;
}

export function SignOutPanel({ redirectUrl, submitLabel }: SignOutPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={pending}
      className="min-h-11 w-full max-w-xs rounded-md border border-border/50 bg-black text-white hover:bg-white/5 sm:w-auto sm:min-w-48"
      onClick={() => {
        startTransition(async () => {
          await signOutAction();
          router.push(redirectUrl);
          router.refresh();
        });
      }}
    >
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {submitLabel}
    </Button>
  );
}
