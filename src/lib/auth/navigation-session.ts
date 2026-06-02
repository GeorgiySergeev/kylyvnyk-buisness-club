import 'server-only';

import { headers } from 'next/headers';
import { cache } from 'react';

import type { SessionRole } from '@/components/layout/navigation';
import type { UserRole } from '@/db/schema/enums/user-role';
import { getCurrentUser } from '@/features/auth/lib/current-user';

export interface NavigationSession {
  role: SessionRole;
  userId?: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
}

const GUEST_SESSION: NavigationSession = {
  role: 'guest',
};

function toSessionRole(role: UserRole): SessionRole {
  if (role === 'GUEST') {
    return 'guest';
  }
  return role;
}

export const getNavigationSession = cache(async (): Promise<NavigationSession> => {
  await headers();

  const user = await getCurrentUser();

  if (!user) {
    return GUEST_SESSION;
  }

  return {
    avatarUrl: user.profile?.avatarUrl ?? undefined,
    displayName: user.displayName ?? undefined,
    email: user.email ?? undefined,
    role: toSessionRole(user.role),
    userId: user.id,
  };
});
