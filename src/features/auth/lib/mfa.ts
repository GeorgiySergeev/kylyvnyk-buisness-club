import 'server-only';

import { env } from '@/lib/env';

export async function hasVerifiedMfaInSession() {
  return env.NODE_ENV !== 'production';
}
