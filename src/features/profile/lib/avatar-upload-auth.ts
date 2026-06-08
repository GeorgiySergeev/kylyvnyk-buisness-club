import 'server-only';

import { getAuthIdentity } from '@/features/auth/lib/auth-identity';

export async function isAvatarUploadDisabledByAuth(): Promise<boolean> {
  const identity = await getAuthIdentity();
  return identity?.devBypass === true;
}
