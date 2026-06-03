import 'server-only';

import { and, desc, eq, isNull, ne, or } from 'drizzle-orm';

import { db } from '@/db/client';
import { clubCards, users } from '@/db/schema';
import type { CardMemberType } from '@/db/schema/enums/card-status';
import { createAuditLog } from '@/lib/audit';

import { deriveDefaultDisplayNameFromCardNumber, generateCardNumber } from './card-number';

async function reserveUniqueCardNumber(phone: string, memberType: CardMemberType, cardId?: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const number = generateCardNumber(phone, memberType);
    const existing = await db.query.clubCards.findFirst({
      where: cardId
        ? and(eq(clubCards.number, number), ne(clubCards.id, cardId))
        : eq(clubCards.number, number),
    });

    if (!existing) {
      return number;
    }
  }

  throw new Error('Failed to generate a unique club card number after 5 attempts.');
}

export async function createCardForUser(
  userId: string,
  phone: string,
  memberType: CardMemberType = 'FREE',
  expiresAt: Date | null = null,
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const number = await reserveUniqueCardNumber(phone, memberType);

    const [card] = await db
      .insert(clubCards)
      .values({
        userId,
        number,
        memberType,
        status: 'ACTIVE',
        expiresAt,
      })
      .onConflictDoNothing({ target: clubCards.number })
      .returning();

    if (card) {
      await db
        .update(users)
        .set({
          displayName: deriveDefaultDisplayNameFromCardNumber(card.number),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(users.id, userId),
            or(isNull(users.displayName), eq(users.displayName, '')),
          ),
        );

      return card;
    }
  }

  throw new Error('Failed to generate a unique club card number after 5 attempts.');
}

export async function archiveCurrentCardAndIssueReplacement(input: {
  actorUserId?: string | null;
  expiresAt: Date | null;
  nextMemberType: CardMemberType;
  userId: string;
}) {
  const user = await db.query.users.findFirst({
    columns: {
      phone: true,
    },
    where: eq(users.id, input.userId),
  });

  if (!user?.phone) {
    throw new Error(`Cannot rotate club card number for user ${input.userId}: phone is missing.`);
  }

  const activeCard = await db.query.clubCards.findFirst({
    columns: {
      id: true,
      memberType: true,
      number: true,
      status: true,
    },
    orderBy: [desc(clubCards.createdAt)],
    where: and(eq(clubCards.userId, input.userId), eq(clubCards.status, 'ACTIVE')),
  });

  const number = await reserveUniqueCardNumber(user.phone, input.nextMemberType);

  const result = await db.transaction(async (tx) => {
    if (activeCard) {
      await tx
        .update(clubCards)
        .set({
          status: 'ARCHIVED',
          updatedAt: new Date(),
        })
        .where(eq(clubCards.id, activeCard.id));
    }

    const [created] = await tx
      .insert(clubCards)
      .values({
        userId: input.userId,
        number,
        memberType: input.nextMemberType,
        status: 'ACTIVE',
        expiresAt: input.expiresAt,
      })
      .returning();

    if (!created) {
      throw new Error(`Cannot reissue club card for user ${input.userId}.`);
    }

    return { activeCard, created };
  });

  await createAuditLog({
    action: 'CARD_REISSUED',
    actorUserId: input.actorUserId ?? null,
    entityId: result.created.id,
    entityType: 'card',
    payload: {
      newCardId: result.created.id,
      newMemberType: input.nextMemberType,
      newNumber: result.created.number,
      previousCardId: result.activeCard?.id ?? null,
      previousMemberType: result.activeCard?.memberType ?? null,
      previousNumber: result.activeCard?.number ?? null,
      targetUserId: input.userId,
    },
  });

  return result.created;
}

export async function getLatestActiveCardForUser(userId: string) {
  return db.query.clubCards.findFirst({
    orderBy: [desc(clubCards.createdAt)],
    where: and(eq(clubCards.userId, userId), eq(clubCards.status, 'ACTIVE')),
  });
}

export async function ensureCardForUser(input: {
  expiresAt?: Date | null;
  memberType: CardMemberType;
  userId: string;
}) {
  const activeCard = await getLatestActiveCardForUser(input.userId);

  if (activeCard) {
    return activeCard;
  }

  const user = await db.query.users.findFirst({
    columns: {
      phone: true,
    },
    where: eq(users.id, input.userId),
  });

  if (!user?.phone) {
    throw new Error(`Cannot create club card for user ${input.userId}: phone is missing.`);
  }

  return createCardForUser(input.userId, user.phone, input.memberType, input.expiresAt ?? null);
}
