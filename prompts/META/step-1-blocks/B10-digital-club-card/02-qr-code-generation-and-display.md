# 02-qr-code-generation-and-display.md

## Title

Digital Card — QR code generation and display

## Objective

Render a QR code that encodes a public verification URL: /verify-card/:number. Display in member dashboard with copy helpers.

## Steps

1. Install react QR library.
2. Create CardQr component that builds absolute verify URL.
3. Create MemberCardPanel to show number, type, status, expiry, and QR.

## Commands

```bash
pnpm add react-qr-code
```

## Files to add

- src/components/card/card-qr.tsx
- src/features/membership/member-card-panel.tsx

### src/components/card/card-qr.tsx

```tsx
'use client';

import QRCode from 'react-qr-code';

export function CardQr({ value, size = 168 }: { value: string; size?: number }) {
  return (
    <div className="inline-block rounded-lg border border-border bg-card p-3">
      <QRCode value={value} size={size} fgColor="currentColor" bgColor="transparent" />
    </div>
  );
}
```

### src/features/membership/member-card-panel.tsx

```tsx
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { CardQr } from '@/components/card/card-qr';
import { cards } from '@/db/schema/membership';
import { StatusBadge } from '@/features/membership/status-badges';
import { TypeBadge } from '@/features/membership/type-badge';
import { db } from '@/lib/db';

function verifyUrl(number: string) {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${base}/verify-card/${encodeURIComponent(number)}`;
}

export default async function MemberCardPanel() {
  const { userId } = auth();
  if (!userId) notFound();

  const row = await db.query.cards.findFirst({ where: eq(cards.userId, userId) });
  if (!row) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-fgMuted">
        Card not yet issued.
      </div>
    );
  }

  const url = verifyUrl(row.number);
  const expires = row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : '—';

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <TypeBadge type={row.memberType as any} />
        <StatusBadge status={row.status as any} expiresAt={row.expiresAt ?? null} />
      </div>
      <div className="text-sm text-fgMuted">Card number</div>
      <div className="text-lg font-semibold">{row.number}</div>

      <div className="text-sm text-fgMuted">Expires</div>
      <div className="text-base">{expires}</div>

      <div className="pt-2">
        <CardQr value={url} />
        <p className="mt-2 text-xs text-fgMuted break-all">{url}</p>
      </div>
    </div>
  );
}
```

## Acceptance

- Member panel shows QR with verification URL.
- Number, type, status, and expiry visible.
- Works in dark theme; QR readable and scannable.
