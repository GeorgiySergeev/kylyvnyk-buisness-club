# step-3-implementations/05-digital-club-card/04-member-card-ui-badges.md

## Title

Member Card UI & Badges

## Objective

UI‑обвязка для личного кабинета: красивая цифровая карточка пользователя, отображение бейджей (VIP / FREE), кнопка "Скачать" или "Сохранить" (MVP: просто визуальный компонент с QR).

## Files

### src/app/(member)/card/page.tsx

```tsx
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

import { Section } from '@/components/ui/section';
import { memberships, users } from '@/db/schema/users';
import { CardQR } from '@/features/members/components/card-qr';
import { ensureMemberCard } from '@/features/members/server/card-generator';
import { db } from '@/lib/db';

export default async function MemberCardPage() {
  const { userId } = auth();
  if (!userId) return null;

  // Гарантируем, что номер карты сгенерирован
  await ensureMemberCard(userId);

  const [data] = await db
    .select({
      cardNumber: memberships.cardNumber,
      tier: memberships.tier,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.userId, userId))
    .limit(1);

  if (!data || !data.cardNumber) return null;

  const isVip = data.tier === 'VIP' || data.tier === 'ADMIN';
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/verify-card/${data.cardNumber}`;

  return (
    <Section>
      <h1 className="h2 mb-6">Digital Club Card</h1>

      <div
        className={`relative max-w-sm rounded-2xl p-6 overflow-hidden text-white shadow-2xl ${isVip ? 'bg-zinc-900 border border-gold-900' : 'bg-zinc-800'}`}
      >
        {/* Decorative elements */}
        {isVip && (
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
        )}

        <div className="relative z-10 flex justify-between items-start mb-8">
          <div>
            <div className="text-xs uppercase tracking-widest text-zinc-400 mb-1">
              Kylyvnyk Club
            </div>
            <div
              className={`text-lg font-bold tracking-widest ${isVip ? 'text-gold-400' : 'text-zinc-200'}`}
            >
              {data.tier} MEMBER
            </div>
          </div>
        </div>

        <div className="relative z-10 mb-8">
          <div className="text-2xl font-light mb-1">
            {data.firstName} {data.lastName}
          </div>
          <div className="font-mono text-sm tracking-widest text-zinc-400">{data.cardNumber}</div>
        </div>

        <div className="relative z-10 bg-white/10 p-4 rounded-xl backdrop-blur-sm flex justify-center">
          <CardQR cardNumber={data.cardNumber} verifyUrl={verifyUrl} />
        </div>
      </div>

      <p className="mt-6 text-sm text-fgMuted max-w-sm">
        Show this QR code at partner locations to claim your benefits. They will scan it to verify
        your active membership.
      </p>
    </Section>
  );
}
```

## Acceptance

- UI‑карта выглядит премиально (особенно VIP).
- QR‑код успешно рендерится и ведет на верный URL.
- Запрашивается `ensureMemberCard`, так что карта есть всегда.
