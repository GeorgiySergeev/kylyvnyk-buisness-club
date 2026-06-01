import 'server-only';

import { and, eq, isNull, or } from 'drizzle-orm';

import { db } from '@/db/client';
import { clubCards, users } from '@/db/schema';
import type { CardMemberType } from '@/db/schema/enums/card-status';

import { deriveDefaultDisplayNameFromCardNumber, generateCardNumber } from './card-number';

export async function createCardForUser(
  userId: string,
  phone: string,
  memberType: CardMemberType = 'FREE',
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const number = generateCardNumber(phone, memberType);

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
