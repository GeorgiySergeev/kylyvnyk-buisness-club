# step-3-implementations/05-digital-club-card/01-card-number-generator.md

## Title

Card Number Generator & Assignment

## Objective

Функция генерации уникального номера карты: `[TIER]-CC-[XXXXXX]` (например, `VIP-CC-A1B2C3`), привязка к `memberships`.

## Files

### src/features/members/server/card-generator.ts

```ts
import 'server-only';
import { db } from '@/lib/db';
import { memberships } from '@/db/schema/users';
import { eq } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';

const generateId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

export async function ensureMemberCard(userId: string) {
  let [membership] = await db
    .select({ id: memberships.id, cardNumber: memberships.cardNumber, tier: memberships.tier })
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .limit(1);

  if (!membership) {
    [membership] = await db.insert(memberships).values({
      userId,
      tier: 'FREE',
      status: 'ACTIVE',
    }).returning();
  }

  if (!membership.cardNumber) {
    const tierPrefix = membership.tier === 'ADMIN' ? 'ADM' : membership.tier;
    const newCard = `${tierPrefix}-CC-${generateId()}`;

    await db.update(memberships).set({ cardNumber: newCard }).where(eq(memberships.id, membership.id));
    membership.cardNumber = newCard;
  }

  return membership;
}
```

## Acceptance

- Гарантируется наличие `cardNumber` для пользователя.
- Формат номера соответствует уровню подписки.