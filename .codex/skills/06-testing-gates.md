# Skill: Testing gates — when to run what

## Before every commit

```bash
pnpm lint && pnpm typecheck && pnpm test:run && pnpm build
# or shorthand:
pnpm verify
```

All 4 must be green. No exceptions.

## Before opening a PR

```bash
pnpm verify          # same as above
pnpm vocab:check     # forbidden vocabulary grep
pnpm env:check       # .env.example ↔ docs/ENV.md parity
pnpm e2e             # Playwright smoke tests
```

## When writing a Server Action (mandatory)

1. Unit test (Vitest): happy path + validation failure path.
2. If action touches DB: integration test with test DB.

```ts
// src/features/introductions/actions/submit-introduction.spec.ts
import { describe, it, expect, vi } from "vitest";

describe("submitIntroduction", () => {
  it("returns VALIDATION_FAILED when clientName is empty", async () => {
    const result = await submitIntroduction({ clientName: "", ... });
    expect(result).toEqual({ ok: false, error: "VALIDATION_FAILED" });
  });

  it("returns ok:true on valid input", async () => {
    // ... mock db, mock auth, ...
  });
});
```

## When adding a public route (mandatory)

Playwright PII assertion test (see skill 05-pii-contracts.md).

## Test file naming

```
*.spec.ts      → Vitest unit/integration
*.e2e.ts       → Playwright end-to-end
```

## Test database

Integration tests need Postgres.
CI provides one via `services: postgres` in GitHub Actions.
Locally: requires Docker running.

```bash
docker info && pnpm test:run   # only runs integration if Docker up
```

## What NOT to test

- Framework internals (Next.js routing — already tested by Vercel).
- shadcn/ui components (tested by shadcn upstream).
- Drizzle ORM itself.

Test your business logic, not the library.
