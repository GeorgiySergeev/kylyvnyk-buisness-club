import 'server-only';

import { auth } from '@clerk/nextjs/server';
import { eq, isNull } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { db } from '@/db/client';
import type { UserRole } from '@/db/schema/enums/user-role';

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
export type PublicUser = Pick<AuthUser, 'displayName' | 'id' | 'role' | 'status'>;
export type AuthErrorCode = 'FORBIDDEN' | 'UNAUTHORIZED';
export type AuthResult<T> = { data: T; ok: true } | { error: AuthErrorCode; ok: false };

export async function getCurrentUser() {
  await headers();

  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return null;
  }

  const user = await db.query.users.findFirst({
    where: (table, { and }) =>
      and(eq(table.clerkUserId, clerkUserId), isNull(table.deletedAt)),
    with: {
      profile: true,
    },
  });

  if (!user || user.status !== 'ACTIVE') {
    return null;
  }

  return user;
}

export async function requireUser(locale: SupportedLocale) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(localizeHref(locale, '/sign-in'));
  }

  return user;
}

export async function requireRole(locale: SupportedLocale, allowed: UserRole | UserRole[]) {
  const user = await requireUser(locale);
  const roles = Array.isArray(allowed) ? allowed : [allowed];

  if (!roles.includes(user.role)) {
    redirect(localizeHref(locale, '/m/dashboard'));
  }

  return user;
}

export async function getCurrentUserWithRole(
  allowed: UserRole | UserRole[],
): Promise<AuthResult<AuthUser>> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: 'UNAUTHORIZED', ok: false };
  }

  const roles = Array.isArray(allowed) ? allowed : [allowed];

  if (!roles.includes(user.role)) {
    return { error: 'FORBIDDEN', ok: false };
  }

  return { data: user, ok: true };
}
