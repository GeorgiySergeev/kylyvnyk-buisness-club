import 'server-only';

import { env } from '@/lib/env';

export async function hasVerifiedMfaInSession() {
  return env.AUTH_DEV_2FA_BYPASS_ENABLED === '1';
}
