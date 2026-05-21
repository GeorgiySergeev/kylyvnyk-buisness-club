# 05-pii-visibility-policy.md

## Title

PII Visibility Policy — safe mapping for public card data

## Objective

Guarantee that verify-card returns only allowed fields. Centralize mapping and provide a small public API for JSON responses (optional).

Allowed fields on public verification:

- memberName
- number
- status (derived)
- memberType
- expiresAt

Forbidden:

- email, phone, payments, history, internal IDs.

## Steps

1. Create a pure transformer mapCardRowToPublicView(row).
2. Use it in page loader (already in S03) and add a public JSON API endpoint.
3. Add a minimal test note and usage doc.

## Files to add/modify

- src/features/membership/server/public-view.ts (append transformer if not present)
- src/app/api/public/verify-card/[number]/route.ts

### src/features/membership/server/public-view.ts (append)

```ts
import type { InferModel } from 'drizzle-orm';

import { cards } from '@/db/schema/membership';

export function mapCardRowToPublicView(row: InferModel<typeof cards, 'select'>) {
  const status = ((): 'ACTIVE' | 'EXPIRED' | 'INACTIVE' => {
    if (row.status === 'INACTIVE') return 'INACTIVE';
    if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) return 'EXPIRED';
    if (row.status === 'EXPIRED') return 'EXPIRED';
    return 'ACTIVE';
  })();

  return {
    number: row.number,
    memberName: row.memberName,
    memberType: (row.memberType as any) ?? 'FREE',
    status,
    expiresAt: row.expiresAt ?? null,
  } as const;
}
```

### src/app/api/public/verify-card/[number]/route.ts

```ts
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { cards } from '@/db/schema/membership';
import { mapCardRowToPublicView } from '@/features/membership/server/public-view';
import { db } from '@/lib/db';

export const runtime = 'edge'; // small JSON, cacheable
export const revalidate = 120;

export async function GET(_: Request, { params }: { params: { number: string } }) {
  const num = decodeURIComponent(params.number);
  const row = await db.query.cards.findFirst({ where: eq(cards.number, num) });
  if (!row) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });

  const safe = mapCardRowToPublicView(row);
  return NextResponse.json(safe, {
    status: 200,
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' },
  });
}
```

## Acceptance

- Public API returns only allowed fields.
- Page and API share the same transformer.
- No PII leaks even if schema expands.
