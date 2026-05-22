import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { eq, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';

import type { SessionRole } from '@/components/layout/navigation';
import { db } from '@/db/client';

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

  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return GUEST_SESSION;
  }

  const user = await db.query.users.findFirst({
    where: (table, { and }) =>
      and(eq(table.clerkUserId, clerkUserId), isNull(table.deletedAt)),
  });

  if (!user || user.status !== 'ACTIVE') {
    return GUEST_SESSION;
  }

  return {
    displayName: user.displayName ?? undefined,
    role: user.role,
    userId: user.id,
  };
}
