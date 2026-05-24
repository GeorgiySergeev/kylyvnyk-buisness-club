import 'server-only';

import { eq } from 'drizzle-orm';

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

    const existing = await db.query.clubCards.findFirst({
      columns: { id: true },
      where: eq(clubCards.number, number),
    });

    if (existing) continue;

    const [card] = await db
      .insert(clubCards)
      .values({
        userId,
        number,
        memberType,
        status: 'ACTIVE',
      })
      .returning();

    return card;
  }

  throw new Error('Failed to generate a unique club card number after 5 attempts.');
}
