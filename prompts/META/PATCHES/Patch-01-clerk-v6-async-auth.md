### Snippet — resolving the current user (server-only)

```ts
// src/lib/auth/current-user.ts
import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/client";
import { users } from "@/db/schema/user";
import { eq } from "drizzle-orm";

export async function getCurrentUserOrThrow() {
  // Clerk v6: auth() is async — MUST be awaited.
  const { userId } = await auth();
  if (!userId) throw new Error("UNAUTHENTICATED");

  const row = await db.query.users.findFirst({
    where: eq(users.clerkUserId, userId),
  });
  if (!row) throw new Error("USER_NOT_PROVISIONED");
  return row;
}
```

### Acceptance

- `pnpm typecheck` passes with `strict: true`.
- All call sites use `await auth()`. CI grep:

  ```bash
  ! grep -RIn "auth()\." app/ src/ | grep -v "await auth()"
  ```