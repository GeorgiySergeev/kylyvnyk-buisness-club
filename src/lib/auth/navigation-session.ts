import 'server-only';

import { eq, isNull, or } from 'drizzle-orm';
import { headers } from 'next/headers';
import { cache } from 'react';

import type { SessionRole } from '@/components/layout/navigation';
import { db } from '@/db/client';
import type { UserRole } from '@/db/schema/enums/user-role';
import { getAuthIdentity } from '@/features/auth/lib/auth-identity';
import { syncAuthUser } from '@/features/auth/lib/sync-auth-user';

export interface NavigationSession {
  role: SessionRole;
  userId?: string;
  displayName?: string;
  avatarUrl?: string;
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

  const identity = await getAuthIdentity();

  if (!identity) {
    return GUEST_SESSION;
  }

  const user = await db.query.users.findFirst({
    where: (table, { and }) =>
      and(
        isNull(table.deletedAt),
        or(eq(table.supabaseUserId, identity.providerUserId), eq(table.phone, identity.phone)),
      ),
    with: {
      profile: {
        columns: {
          avatarUrl: true,
        },
      },
    },
  });

  if (!user) {
    const synced = await syncAuthUser(identity);
    if (synced.user.status !== 'ACTIVE') {
      return GUEST_SESSION;
    }

    const syncedProfile = await db.query.profiles.findFirst({
      columns: {
        avatarUrl: true,
      },
      where: (table, { eq }) => eq(table.userId, synced.user.id),
    });
    return {
      avatarUrl: syncedProfile?.avatarUrl ?? undefined,
      displayName: synced.user.displayName ?? undefined,
      role: toSessionRole(synced.user.role),
      userId: synced.user.id,
    };
  }

  if (user.status !== 'ACTIVE') {
    return GUEST_SESSION;
  }

  return {
    avatarUrl: user.profile?.avatarUrl ?? undefined,
    displayName: user.displayName ?? undefined,
    role: toSessionRole(user.role),
    userId: user.id,
  };
});
