import 'server-only';

import { and, eq, isNull, or } from 'drizzle-orm';

import { db } from '@/db/client';
import { auditLogs, profiles, users } from '@/db/schema';
import { ensureFreeMembershipWhenNoActiveVip } from '@/features/billing/lib/membership-access';

import type { AuthIdentity } from './auth-identity';

/**
 * Atomically upsert the application user record that mirrors a Supabase Auth identity.
 *
 * ## Why upsert instead of SELECT → INSERT?
 *
 * The original SELECT → INSERT pattern had a TOCTOU (Time-Of-Check-Time-Of-Use) race
 * condition. Two concurrent requests (e.g. two browser tabs opening simultaneously, or
 * `navigation-session.ts` + `current-user.ts` running in the same SSR render without
 * sharing a React `cache()` boundary) could both find no existing row and then both
 * attempt an INSERT, causing:
 *
 *   PostgresError: duplicate key value violates unique constraint "users_supabase_user_id_ux"
 *
 * The fix uses two atomic upserts:
 *  1. Try to insert by (supabase_user_id). On conflict → update supabase_user_id + updatedAt
 *     so that an existing phone-only row gets its supabaseUserId backfilled.
 *  2. If that still finds no row (shouldn't happen), fall back to a phone-keyed upsert.
 *
 * Both profile and auditLog inserts already use `onConflictDoNothing()` so they are
 * idempotent when called multiple times for the same user.
 */
export async function syncAuthUser(identity: AuthIdentity, displayName?: string) {
  const now = new Date();
  const authProvider = identity.devBypass ? 'dev-phone-bypass' : 'supabase';

  const result = await db.transaction(async (tx) => {
    // ── Phase 1: Atomic upsert keyed on supabase_user_id ────────────────────
    // This is the primary path for every sign-in after the first.
    // ON CONFLICT (supabase_user_id) → UPDATE keeps updatedAt fresh.
    // We include phone in the update so a previously phone-only row gets linked.
    const [insertedBySupabaseId] = await tx
      .insert(users)
      .values({
        displayName: displayName ?? null,
        phone: identity.phone,
        role: 'MEMBER',
        status: 'ACTIVE',
        supabaseUserId: identity.providerUserId,
        updatedAt: now,
      })
      .onConflictDoNothing({ target: users.supabaseUserId })
      .returning();

    if (insertedBySupabaseId) {
      await tx.insert(profiles).values({ userId: insertedBySupabaseId.id }).onConflictDoNothing();

      await tx.insert(auditLogs).values({
        action: 'USER_AUTH_CREATED',
        actorUserId: insertedBySupabaseId.id,
        entityId: insertedBySupabaseId.id,
        entityType: 'user',
        payload: { authProvider },
      });
      await tx.insert(auditLogs).values({
        action: 'USER_AUTH_SIGN_IN',
        actorUserId: insertedBySupabaseId.id,
        entityId: insertedBySupabaseId.id,
        entityType: 'user',
        payload: { authProvider },
      });

      return { isNew: true, user: insertedBySupabaseId };
    }

    const [updatedBySupabaseId] = await tx
      .update(users)
      .set({
        phone: identity.phone,
        supabaseUserId: identity.providerUserId,
        updatedAt: now,
      })
      .where(eq(users.supabaseUserId, identity.providerUserId))
      .returning();

    if (updatedBySupabaseId) {
      await tx.insert(profiles).values({ userId: updatedBySupabaseId.id }).onConflictDoNothing();
      await tx.insert(auditLogs).values({
        action: 'USER_AUTH_SIGN_IN',
        actorUserId: updatedBySupabaseId.id,
        entityId: updatedBySupabaseId.id,
        entityType: 'user',
        payload: { authProvider },
      });

      return { isNew: false, user: updatedBySupabaseId };
    }

    // ── Phase 2: Fallback — row exists by phone but supabaseUserId differs ──
    // This handles the first login of a pre-provisioned (phone-only) user.
    const [upsertedByPhone] = await tx
      .insert(users)
      .values({
        displayName: displayName ?? null,
        phone: identity.phone,
        role: 'MEMBER',
        status: 'ACTIVE',
        supabaseUserId: identity.providerUserId,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: users.phone,
        set: {
          supabaseUserId: identity.providerUserId,
          updatedAt: now,
        },
      })
      .returning();

    if (upsertedByPhone) {
      await tx.insert(profiles).values({ userId: upsertedByPhone.id }).onConflictDoNothing();
      await tx.insert(auditLogs).values({
        action: 'USER_AUTH_SIGN_IN',
        actorUserId: upsertedByPhone.id,
        entityId: upsertedByPhone.id,
        entityType: 'user',
        payload: { authProvider },
      });

      return { isNew: false, user: upsertedByPhone };
    }

    // ── Phase 3: Last-resort read ────────────────────────────────────────────
    // Should be unreachable, but guards against unexpected DB behaviour.
    const fallback = await tx.query.users.findFirst({
      where: and(
        isNull(users.deletedAt),
        or(eq(users.phone, identity.phone), eq(users.supabaseUserId, identity.providerUserId)),
      ),
    });

    if (!fallback) {
      throw new Error('syncAuthUser: failed to upsert or locate user record.');
    }

    await tx.insert(profiles).values({ userId: fallback.id }).onConflictDoNothing();
    await tx.insert(auditLogs).values({
      action: 'USER_AUTH_SIGN_IN',
      actorUserId: fallback.id,
      entityId: fallback.id,
      entityType: 'user',
      payload: { authProvider },
    });

    return { isNew: false, user: fallback };
  });

  await ensureFreeMembershipWhenNoActiveVip(result.user.id, now);
  return result;
}
