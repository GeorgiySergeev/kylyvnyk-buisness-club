import 'server-only';

import { and, eq, isNull, ne, or } from 'drizzle-orm';

import { db } from '@/db/client';
import { clubCards, users } from '@/db/schema';
import type { CardMemberType } from '@/db/schema/enums/card-status';

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

export async function rotateCardNumberForUser(input: {
  cardId: string;
  memberType: CardMemberType;
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

  const number = await reserveUniqueCardNumber(user.phone, input.memberType, input.cardId);

  const [updated] = await db
    .update(clubCards)
    .set({
      memberType: input.memberType,
      number,
      updatedAt: new Date(),
    })
    .where(eq(clubCards.id, input.cardId))
    .returning();

  if (!updated) {
    throw new Error(`Cannot rotate club card number for user ${input.userId}: card was not found.`);
  }

  return updated;
}
