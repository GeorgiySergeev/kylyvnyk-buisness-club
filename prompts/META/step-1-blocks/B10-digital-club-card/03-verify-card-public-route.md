# 03-verify-card-public-route.md

## Title

Verify Card — public page /verify-card/:number (no PII)

## Objective

Create a public route to validate a card by number and show only allowed fields:

- memberName
- number
- status (derived: ACTIVE/EXPIRED/INACTIVE)
- memberType (FREE/VIP)
- expiresAt

No email, phone, payments, or history.

## Steps

1. Add server function to fetch a card by number and map to public view.
2. Add route /verify-card/[number]/page.tsx to display.
3. Add not-found and error behavior.

## Files to add

- src/features/membership/server/public-view.ts
- src/app/(public)/verify-card/[number]/page.tsx
- src/app/(public)/verify-card/[number]/not-found.tsx (optional message)

### src/features/membership/server/public-view.ts

```ts
import { eq } from 'drizzle-orm';
import 'server-only';

import { cards } from '@/db/schema/membership';
import { db } from '@/lib/db';

export type CardPublicView = {
  number: string;
  memberName: string;
  memberType: 'FREE' | 'VIP';
  status: 'ACTIVE' | 'EXPIRED' | 'INACTIVE';
  expiresAt: Date | null;
};

function deriveStatus(
  dbStatus: 'ACTIVE' | 'INACTIVE' | 'EXPIRED',
  expiresAt: Date | null,
): CardPublicView['status'] {
  if (dbStatus === 'INACTIVE') return 'INACTIVE';
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) return 'EXPIRED';
  if (dbStatus === 'EXPIRED') return 'EXPIRED';
  return 'ACTIVE';
}

export async function getPublicCardByNumber(number: string): Promise<CardPublicView | null> {
  const row = await db.query.cards.findFirst({ where: eq(cards.number, number) });
  if (!row) return null;

  return {
    number: row.number,
    memberName: row.memberName,
    memberType: (row.memberType as any) ?? 'FREE',
    status: deriveStatus(row.status as any, row.expiresAt ?? null),
    expiresAt: row.expiresAt ?? null,
  };
}
```

### src/app/(public)/verify-card/[number]/page.tsx

```tsx
import { notFound } from 'next/navigation';

import { Section } from '@/components/ui/section';
import { getPublicCardByNumber } from '@/features/membership/server/public-view';
import { StatusBadge } from '@/features/membership/status-badges';
import { TypeBadge } from '@/features/membership/type-badge';

export const revalidate = 120; // seconds, MVP caching

export default async function VerifyCardPage({ params }: { params: { number: string } }) {
  const data = await getPublicCardByNumber(decodeURIComponent(params.number));
  if (!data) notFound();

  return (
    <Section>
      <h1 className="h2">Verify Club Card</h1>
      <div className="mt-5 rounded-lg border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <TypeBadge type={data.memberType} />
          <StatusBadge status={data.status} expiresAt={data.expiresAt} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-sm text-fgMuted">Member</div>
            <div className="text-base font-medium">{data.memberName}</div>
          </div>
          <div>
            <div className="text-sm text-fgMuted">Card number</div>
            <div className="text-base font-medium">{data.number}</div>
          </div>
          <div>
            <div className="text-sm text-fgMuted">Expires</div>
            <div className="text-base">
              {data.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : '—'}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-fgMuted">
        KYLYVNYK CLUB is an independent private membership platform. We do not display contact or
        payment data on this page.
      </p>
    </Section>
  );
}
```

### src/app/(public)/verify-card/[number]/not-found.tsx

```tsx
import { Section } from '@/components/ui/section';

export default function CardNotFound() {
  return (
    <Section>
      <h1 className="h2">Verify Club Card</h1>
      <div className="mt-5 rounded-lg border border-border bg-card p-6 text-sm text-fgMuted">
        Card not found. Please check the number.
      </div>
    </Section>
  );
}
```

## Acceptance

- /verify-card/<number> shows allowed fields only.
- 404 when card not found.
- Caching set to 120s by default; no PII exposed.
