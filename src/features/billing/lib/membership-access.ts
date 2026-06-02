import 'server-only';

import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { clubCards, memberships } from '@/db/schema';
import type { CardMemberType } from '@/db/schema/enums/card-status';
import {
  archiveCurrentCardAndIssueReplacement,
  ensureCardForUser,
  getLatestActiveCardForUser,
} from '@/features/auth/lib/card';
import { shouldRotateCardNumber } from '@/features/auth/lib/card-number';
import {
  BUSINESS_PLAN_CODE,
  FREE_PLAN_CODE,
  type MembershipTierCode,
  VIP_PLAN_CODE,
} from '@/features/billing/lib/plan-codes';
export { resolveEffectiveMembership } from '@/features/billing/lib/membership-resolver';

export type MembershipAccessStatus = 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'INACTIVE' | 'PAST_DUE';

export async function ensureFreeMembership(userId: string, startsAt = new Date()) {
  const existing = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, userId),
      eq(memberships.planCode, FREE_PLAN_CODE),
      isNull(memberships.deletedAt),
    ),
  });

  const now = new Date();

  if (existing) {
    if (existing.status === 'ACTIVE') {
      return existing;
    }

    const [updated] = await db
      .update(memberships)
      .set({
        endsAt: null,
        startsAt,
        status: 'ACTIVE',
        updatedAt: now,
      })
      .where(eq(memberships.id, existing.id))
      .returning();

    return updated ?? existing;
  }

  const [created] = await db
    .insert(memberships)
    .values({
      endsAt: null,
      planCode: FREE_PLAN_CODE,
      startsAt,
      status: 'ACTIVE',
      userId,
    })
    .returning();

  return created;
}

export async function ensureFreeMembershipWhenNoActiveVip(userId: string, startsAt = new Date()) {
  const vipMembership = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, userId),
      eq(memberships.planCode, VIP_PLAN_CODE),
      eq(memberships.status, 'ACTIVE'),
      isNull(memberships.deletedAt),
    ),
  });

  if (vipMembership && (!vipMembership.endsAt || vipMembership.endsAt.getTime() >= Date.now())) {
    return null;
  }

  return ensureFreeMembership(userId, startsAt);
}

export async function deactivateFreeMembership(userId: string, status: MembershipAccessStatus = 'INACTIVE') {
  await db
    .update(memberships)
    .set({
      endsAt: new Date(),
      status,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.planCode, FREE_PLAN_CODE),
        eq(memberships.status, 'ACTIVE'),
        isNull(memberships.deletedAt),
      ),
    );
}

function mapTierToCardMemberType(tier: MembershipTierCode): CardMemberType {
  if (tier === BUSINESS_PLAN_CODE) {
    return 'BUSINESS';
  }

  if (tier === VIP_PLAN_CODE) {
    return 'VIP';
  }

  return 'FREE';
}

export async function syncClubCardAccess(
  userId: string,
  memberType: CardMemberType,
  expiresAt: Date | null,
  actorUserId?: string | null,
) {
  const card =
    (await getLatestActiveCardForUser(userId)) ??
    (await ensureCardForUser({ expiresAt, memberType, userId }));

  if (shouldRotateCardNumber(card.memberType, memberType)) {
    await archiveCurrentCardAndIssueReplacement({
      actorUserId,
      expiresAt,
      nextMemberType: memberType,
      userId,
    });
    return;
  }

  await db
    .update(clubCards)
    .set({
      expiresAt,
      memberType,
      updatedAt: new Date(),
    })
    .where(eq(clubCards.id, card.id));
}

export async function syncPrimaryMembershipAccess(input: {
  actorUserId?: string | null;
  expiresAt: Date | null;
  status: MembershipAccessStatus;
  tier: MembershipTierCode;
  userId: string;
}) {
  if (input.tier === VIP_PLAN_CODE && input.status === 'ACTIVE') {
    await deactivateFreeMembership(input.userId);
    await syncClubCardAccess(input.userId, 'VIP', input.expiresAt, input.actorUserId);
    return;
  }

  if (input.tier === BUSINESS_PLAN_CODE && input.status === 'ACTIVE') {
    await deactivateFreeMembership(input.userId);
    await syncClubCardAccess(input.userId, 'BUSINESS', input.expiresAt, input.actorUserId);
    return;
  }

  if (input.tier === VIP_PLAN_CODE) {
    await ensureFreeMembership(input.userId);
    await syncClubCardAccess(input.userId, 'FREE', null, input.actorUserId);
    return;
  }

  if (input.tier === BUSINESS_PLAN_CODE) {
    await ensureFreeMembership(input.userId);
    await syncClubCardAccess(input.userId, 'FREE', null, input.actorUserId);
    return;
  }

  if (input.tier === FREE_PLAN_CODE && input.status === 'ACTIVE') {
    await syncClubCardAccess(input.userId, 'FREE', null, input.actorUserId);
  }
}

export async function setUserMembershipTier(
  userId: string,
  tier: MembershipTierCode,
  startsAt = new Date(),
  actorUserId?: string | null,
) {
  const existing = await db.query.memberships.findFirst({
    where: and(
      eq(memberships.userId, userId),
      eq(memberships.planCode, tier),
      isNull(memberships.deletedAt),
    ),
  });

  const now = new Date();

  if (existing) {
    await db
      .update(memberships)
      .set({
        endsAt: null,
        startsAt,
        status: 'ACTIVE',
        updatedAt: now,
      })
      .where(eq(memberships.id, existing.id));
  } else {
    await db.insert(memberships).values({
      endsAt: null,
      planCode: tier,
      startsAt,
      status: 'ACTIVE',
      userId,
    });
  }

  if (tier !== FREE_PLAN_CODE) {
    await deactivateFreeMembership(userId);
  }

  if (tier === FREE_PLAN_CODE) {
    await db
      .update(memberships)
      .set({
        endsAt: now,
        status: 'INACTIVE',
        updatedAt: now,
      })
      .where(
        and(
          eq(memberships.userId, userId),
          eq(memberships.status, 'ACTIVE'),
          isNull(memberships.deletedAt),
        ),
      );

    await ensureFreeMembership(userId, startsAt);
  }

  await syncClubCardAccess(userId, mapTierToCardMemberType(tier), null, actorUserId);
}
