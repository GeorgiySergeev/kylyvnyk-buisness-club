import 'server-only';

import { eq, isNull, or } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { db } from '@/db/client';
import type { UserRole } from '@/db/schema/enums/user-role';

import { getAuthIdentity } from './auth-identity';
import type { AuthIdentity } from './auth-identity';

export type AuthUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
export type PublicUser = Pick<AuthUser, 'displayName' | 'id' | 'role' | 'status'>;
export type AuthErrorCode = 'FORBIDDEN' | 'UNAUTHORIZED';
export type AuthResult<T> = { data: T; ok: true } | { error: AuthErrorCode; ok: false };

export async function findExistingUserByPhone(phone: string) {
  return db.query.users.findFirst({
    where: (table, { and }) => and(isNull(table.deletedAt), eq(table.phone, phone)),
  });
}

export async function findExistingUserByIdentity(identity: AuthIdentity) {
  return db.query.users.findFirst({
    where: (table, { and }) =>
      and(
        isNull(table.deletedAt),
        or(eq(table.supabaseUserId, identity.providerUserId), eq(table.phone, identity.phone)),
      ),
    with: {
      profile: {
        with: {
          city: { columns: { name: true } },
          country: { columns: { name: true } },
        },
      },
    },
  });
}

export const getCurrentUser = cache(async () => {
  await headers();

  const identity = await getAuthIdentity();

  if (!identity) {
    return null;
  }

  const user = await findExistingUserByIdentity(identity);

  if (!user) {
    return null;
  }

  if (user.status !== 'ACTIVE') {
    return null;
  }

  return user;
});

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
