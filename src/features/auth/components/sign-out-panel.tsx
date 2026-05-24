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
      className="min-h-11"
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
