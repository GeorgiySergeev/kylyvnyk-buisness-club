import 'server-only';

import { eq, isNull, or } from 'drizzle-orm';
import { headers } from 'next/headers';

import type { SessionRole } from '@/components/layout/navigation';
import { db } from '@/db/client';
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

export async function getNavigationSession(): Promise<NavigationSession> {
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
  });

  if (!user) {
    const synced = await syncAuthUser(identity);
    return {
      displayName: synced.user.displayName ?? undefined,
      role: synced.user.role,
      userId: synced.user.id,
    };
  }

  if (!user || user.status !== 'ACTIVE') {
    return GUEST_SESSION;
  }

  return {
    displayName: user.displayName ?? undefined,
    role: user.role,
    userId: user.id,
  };
}
