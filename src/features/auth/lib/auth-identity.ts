import 'server-only';

import { cookies, headers } from 'next/headers';
import { cache } from 'react';

import { decodeDevPhoneAuthCookie,DEV_PHONE_AUTH_COOKIE } from '@/features/auth/lib/dev-auth';
import { env } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export interface AuthIdentity {
  devBypass: boolean;
  phone: string;
  providerUserId: string;
}

export function isAuthDevPhoneBypassEnabled() {
  return env.NODE_ENV !== 'production' && env.AUTH_DEV_PHONE_BYPASS_ENABLED === '1';
}

export const getAuthIdentity = cache(async (): Promise<AuthIdentity | null> => {
  await headers();

  if (isAuthDevPhoneBypassEnabled()) {
    const devPhone = decodeDevPhoneAuthCookie((await cookies()).get(DEV_PHONE_AUTH_COOKIE)?.value);

    if (devPhone) {
      return {
        devBypass: true,
        phone: devPhone,
        providerUserId: `dev:${devPhone}`,
      };
    }
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const phone = user?.phone?.trim();

  if (!user || !phone) {
    return null;
  }

  return {
    devBypass: false,
    phone,
    providerUserId: user.id,
  };
});
