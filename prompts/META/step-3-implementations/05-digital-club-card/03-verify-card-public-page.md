# step-3-implementations/05-digital-club-card/03-verify-card-public-page.md

## Title

Public Verification Page (/verify-card/[number])

## Objective

ISR/Dynamic страница для проверки подлинности карты. Скрывает PII, показывает только статус (Active/Inactive), тип (FREE/VIP) и инициалы (например, John D.).

## Files

### src/app/verify-card/[number]/page.tsx

```tsx
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { Section } from '@/components/ui/section';
import { memberships, users } from '@/db/schema/users';
import { db } from '@/lib/db';

export const revalidate = 60; // ISR 60 секунд (или dynamic 'force-dynamic')

export default async function VerifyCardPage({ params }: { params: { number: string } }) {
  const [data] = await db
    .select({
      status: memberships.status,
      tier: memberships.tier,
      firstName: users.firstName,
      lastName: users.lastName,
      validUntil: memberships.currentPeriodEnd,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.cardNumber, params.number))
    .limit(1);

  if (!data) notFound();

  const initial = data.lastName ? `${data.lastName[0]}.` : '';
  const maskedName = `${data.firstName} ${initial}`.trim() || 'Member';
  const isActive = data.status === 'ACTIVE';

  return (
    <Section className="max-w-md mx-auto text-center py-12">
      <div className="mb-6">
        {isActive ? (
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500">
            <span className="text-4xl">✓</span>
          </div>
        ) : (
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <span className="text-4xl">✕</span>
          </div>
        )}
      </div>

      <h1 className="h3 mb-2">{maskedName}</h1>
      <p className="font-mono text-sm text-fgMuted mb-6">{params.number}</p>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4 text-left">
        <div className="flex justify-between border-b border-border pb-3">
          <span className="text-fgMuted text-sm">Status</span>
          <span className={`font-semibold ${isActive ? 'text-green-500' : 'text-red-500'}`}>
            {data.status}
          </span>
        </div>

        <div className="flex justify-between border-b border-border pb-3">
          <span className="text-fgMuted text-sm">Membership</span>
          <span className={`font-semibold ${data.tier === 'VIP' ? 'text-gold-400' : 'text-fg'}`}>
            {data.tier}
          </span>
        </div>

        {data.tier === 'VIP' && data.validUntil && (
          <div className="flex justify-between">
            <span className="text-fgMuted text-sm">Valid until</span>
            <span className="font-semibold text-fg">{data.validUntil.toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </Section>
  );
}
```

## Acceptance

- Без PII (нет email, нет полного last_name, нет телефона).
- ISR кэширование или fast dynamic.
- Визуально понятно Active / Inactive.
