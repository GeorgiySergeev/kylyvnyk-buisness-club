import 'server-only';

import { and, eq, isNull, or } from 'drizzle-orm';

import { db } from '@/db/client';
import { auditLogs, profiles, users } from '@/db/schema';

import type { AuthIdentity } from './auth-identity';

export async function syncAuthUser(identity: AuthIdentity, displayName?: string) {
  const existing = await db.query.users.findFirst({
    where: (table, { and, eq, isNull, or }) =>
      and(
        isNull(table.deletedAt),
        or(eq(table.phone, identity.phone), eq(table.supabaseUserId, identity.providerUserId)),
      ),
  });

  if (existing) {
    if (existing.supabaseUserId !== identity.providerUserId) {
      const [updated] = await db
        .update(users)
        .set({
          supabaseUserId: identity.providerUserId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning();

      return { isNew: false, user: updated ?? existing };
    }

    return { isNew: false, user: existing };
  }

  const now = new Date();
  const [created] = await db.transaction(async (tx) => {
    const rows = await tx
      .insert(users)
      .values({
        phone: identity.phone,
        displayName: displayName ?? null,
        role: 'MEMBER',
        status: 'ACTIVE',
        supabaseUserId: identity.providerUserId,
        updatedAt: now,
      })
      .returning();

    const user = rows[0];

    if (user) {
      await tx.insert(profiles).values({ userId: user.id }).onConflictDoNothing();

      await tx.insert(auditLogs).values({
        action: 'USER_AUTH_CREATED',
        actorUserId: user.id,
        entityId: user.id,
        entityType: 'user',
        payload: {
          authProvider: identity.devBypass ? 'dev-phone-bypass' : 'supabase',
        },
      });
    }

    return rows;
  });

  if (!created) {
    const user = await db.query.users.findFirst({
      where: and(
        isNull(users.deletedAt),
        or(eq(users.phone, identity.phone), eq(users.supabaseUserId, identity.providerUserId)),
      ),
    });

    if (!user) {
      throw new Error('Failed to sync authenticated user.');
    }

    return { isNew: false, user };
  }

  return { isNew: true, user: created };
}
