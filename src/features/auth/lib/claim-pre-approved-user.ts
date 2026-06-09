import 'server-only';

import { and, eq, isNull, or } from 'drizzle-orm';

import { db } from '@/db/client';
import { auditLogs, profiles, users } from '@/db/schema';
import { ensureFreeMembershipWhenNoActiveVip } from '@/features/billing/lib/membership-access';

import type { AuthIdentity } from './auth-identity';
import { ensureCardForUser } from './card';
import { isRealSupabaseUserId } from './supabase-user-id';

export type ClaimPreApprovedFailureReason = 'NOT_FOUND' | 'INACTIVE' | 'BANNED';

export type ClaimPreApprovedResult =
  | { linked: boolean; ok: true; user: typeof users.$inferSelect }
  | { ok: false; reason: ClaimPreApprovedFailureReason };

export async function claimPreApprovedUser(
  identity: AuthIdentity,
): Promise<ClaimPreApprovedResult> {
  const existing = await db.query.users.findFirst({
    where: and(
      isNull(users.deletedAt),
      or(eq(users.phone, identity.phone), eq(users.supabaseUserId, identity.providerUserId)),
    ),
  });

  if (!existing) {
    return { ok: false, reason: 'NOT_FOUND' };
  }

  if (existing.status === 'BANNED') {
    return { ok: false, reason: 'BANNED' };
  }

  if (existing.status === 'INACTIVE') {
    return { ok: false, reason: 'INACTIVE' };
  }

  const hasRealSupabaseLink = isRealSupabaseUserId(existing.supabaseUserId);

  if (hasRealSupabaseLink && existing.supabaseUserId !== identity.providerUserId) {
    return { ok: false, reason: 'NOT_FOUND' };
  }

  const now = new Date();
  const needsSupabaseLink = !hasRealSupabaseLink;
  let user = existing;

  if (needsSupabaseLink) {
    const [updated] = await db
      .update(users)
      .set({
        supabaseUserId: identity.providerUserId,
        updatedAt: now,
      })
      .where(and(eq(users.id, existing.id), isNull(users.deletedAt)))
      .returning();

    if (!updated) {
      return { ok: false, reason: 'NOT_FOUND' };
    }

    user = updated;
  }

  await db.insert(profiles).values({ userId: user.id }).onConflictDoNothing();
  await ensureFreeMembershipWhenNoActiveVip(user.id, now);
  await ensureCardForUser({ memberType: 'FREE', userId: user.id });

  if (needsSupabaseLink) {
    await db.insert(auditLogs).values({
      action: 'USER_PHONE_CLAIMED',
      actorUserId: user.id,
      entityId: user.id,
      entityType: 'user',
      payload: {
        authProvider: identity.devBypass ? 'dev-phone-bypass' : 'supabase',
        replacedDevLink: existing.supabaseUserId?.startsWith('dev:') ?? false,
      },
    });
  }

  return { linked: needsSupabaseLink, ok: true, user };
}
