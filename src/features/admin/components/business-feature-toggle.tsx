'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { toggleBusinessFeatureAction } from '../actions/business-admin.action';

type BusinessFeatureToggleProps = {
  businessId: string;
  feature: 'isRecommended' | 'isTopPartner';
  pressed: boolean;
};

export function BusinessFeatureToggle({
  businessId,
  feature,
  pressed,
}: BusinessFeatureToggleProps) {
  const router = useRouter();
  const [isPressed, setIsPressed] = useState(pressed);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const nextValue = !isPressed;
    setIsPressed(nextValue);
    setError(false);

    startTransition(async () => {
      const result = await toggleBusinessFeatureAction({
        businessId,
        [feature]: nextValue,
      });

      if (!result.ok) {
        setIsPressed(!nextValue);
        setError(true);
        return;
      }

      router.refresh();
    });
  }

  return (
    <Button
      aria-pressed={isPressed}
      className={cn(
        'h-8 min-w-16 rounded-md px-2 text-[11px] font-semibold uppercase tracking-[0.08em]',
        isPressed
          ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15'
          : 'border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10',
        error && 'border-red-500/40 text-red-300',
      )}
      disabled={pending}
      onClick={toggle}
      size="sm"
      type="button"
      variant="outline"
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
      {isPressed ? 'ON' : 'OFF'}
    </Button>
  );
}
