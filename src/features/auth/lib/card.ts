import 'server-only';

import { db } from '@/db/client';
import { clubCards } from '@/db/schema';
import type { CardMemberType } from '@/db/schema/enums/card-status';

import { generateCardNumber } from './card-number';

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
      return card;
    }
  }

  throw new Error('Failed to generate a unique club card number after 5 attempts.');
}
