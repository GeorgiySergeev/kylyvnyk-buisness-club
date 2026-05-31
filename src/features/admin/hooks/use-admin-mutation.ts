'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

type MutationResult = { ok: true } | { error: string; ok: false };

export function useAdminMutation() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const run = useCallback(async (mutation: () => Promise<MutationResult>): Promise<MutationResult> => {
    setPending(true);
    try {
      return await mutation();
    } finally {
      setPending(false);
    }
  }, []);

  const refresh = useCallback(() => {
    void router.refresh();
  }, [router]);

  return { pending, refresh, run };
}
