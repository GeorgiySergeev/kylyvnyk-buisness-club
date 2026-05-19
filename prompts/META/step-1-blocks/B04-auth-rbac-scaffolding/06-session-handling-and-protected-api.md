# 06-session-handling-and-protected-api.md

## Title

Sessions and protected API routes (App Router)

## Objective

Demonstrate session access on server, a protected API route, and a server action using Clerk auth().

## Steps

1) Create a protected API route that returns current user info.
2) Create a server action that requires auth and echoes minimal data.
3) Provide a small UI component to call the API and render session.

## Files to add

- src/app/api/protected/route.ts
- src/features/auth/server/actions.ts
- src/components/common/session-info.tsx (demo)

### src/app/api/protected/route.ts

```ts
import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId, sessionId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await currentUser();
  return NextResponse.json({
    userId,
    sessionId,
    email: user?.emailAddresses?.[0]?.emailAddress ?? null,
  });
}
```

### src/features/auth/server/actions.ts

```ts
'use server';

import { auth } from '@clerk/nextjs/server';

export async function echoSecureMessage(formData: FormData) {
  const { userId } = auth();
  if (!userId) {
    return { ok: false, error: 'UNAUTHORIZED' };
  }
  const message = String(formData.get('message') ?? '');
  return { ok: true, data: { userId, message } };
}
```

### src/components/common/session-info.tsx

```tsx
'use client';

import { useEffect, useState } from 'react';

export function SessionInfo() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/protected')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ error: 'Request failed' }));
  }, []);

  return (
    <div className="mt-4 rounded border border-border p-4 text-sm">
      <pre className="whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

Notes

- For server actions, always call auth() server-side; never trust client input.
- Public API routes should live under /api/public/* and must not leak PII.

## Acceptance

- GET /api/protected returns 401 for guests, user/session data for signed-in users.
- Server action returns UNAUTHORIZED for guests, echoes for signed-in users.
- SessionInfo component renders current session JSON when signed in.
