# 01-auth-clerk/04-session-and-protected-api-routes.md

## Title

Session Checks & Protected API Routes / Server Actions

## Objective

Установить стандарт защиты API Routes и Server Actions.

## Files

### Пример защищенного Server Action (src/app/actions.ts)

```ts
'use server';

import 'server-only';
import { requireAuth } from '@/features/auth/server/guards';
import { logAudit } from '@/features/audit/server/log';

export async function doProtectedAction() {
  const userId = await requireAuth();
  
  // Бизнес-логика...
  
  await logAudit({ action: 'PROTECTED_ACTION', entity: 'user', entityId: userId });
  return { success: true };
}
```

### Пример защищенного API Route (src/app/api/protected/route.ts)

```ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.json({ message: 'Success', userId });
}
```

## Acceptance
- Доступ только при наличии userId.
- Использование 'server-only' для защиты кода от попадания на клиент.