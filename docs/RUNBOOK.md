# KCLUB Runbook

Last refreshed: 2026-06-06.

## Source of Truth

- Stack and architecture: `docs/STACK-DECISION.md`
- Product scope and route model: `docs/SPEC.md`
- Release plan: `docs/RELEASE-ROADMAP.md`
- Test strategy: `docs/TESTING.md`
- Historical context map: `docs/LEGACY-CONTEXT.md`

Older runbook content mentioned Clerk, obsolete test commands, and Docker test
flows that are not present in the current `package.json`. This version is
aligned with the live scripts.

## Local Setup

Use Node 20.x and pnpm 9.x.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

The package manager is pinned in `package.json`. Do not use npm or yarn for this
repo.

## Core Commands

```bash
pnpm lint
pnpm vocab:check
pnpm env:check
pnpm build
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm test:e2e:smoke
pnpm verify
```

`pnpm verify` is the canonical release gate. It runs lint, vocabulary check, env
check, build, typecheck, and the combined test suite.

## Test Commands

```bash
pnpm test              # legacy tsx runner plus required Vitest projects
pnpm test:legacy       # existing node:test files during migration
pnpm test:unit         # Vitest unit and contract projects
pnpm test:integration  # Vitest integration project
pnpm test:component    # Vitest jsdom/RTL component project
pnpm test:coverage     # Vitest coverage baseline
pnpm test:e2e:smoke    # Playwright @smoke suite
```

The legacy runner remains intentional until all legacy `node:test` files have
Vitest parity. Do not remove `test:legacy` in a documentation cleanup.

## Playwright Smoke

Local Playwright smoke uses a dedicated server flow from `playwright.config.ts`.
If a stale Next process or a different app is already using the configured port,
stop that process before running smoke.

```bash
pnpm test:e2e:smoke
```

CI installs Chromium and uploads `playwright-report` as an artifact.

## Database Commands

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
pnpm db:seed
```

`pnpm db:push` is intentionally disabled. Migrations are append-only unless a
human explicitly approves a destructive operation.

## Environment

Environment contracts are documented in `docs/ENV.md` and enforced by:

```bash
pnpm env:check
```

New env vars require the same diff to update `.env.example` and `docs/ENV.md`.

## Release Procedure

1. Refresh branch and check local changes.
2. Run `pnpm verify`.
3. Run `pnpm test:coverage`.
4. Run `pnpm test:e2e:smoke`.
5. Confirm release blockers in `docs/RELEASE-ROADMAP.md` and
   `docs/RELEASE-STATUS.md`.
6. Record the commands and outcomes in the release PR or release report.

Before the final release sprint, run the gate on Node 20.18.x with a clean
`.next` state. If typecheck behaves strangely after an interrupted build, remove
`.next`, rebuild, then rerun the gate.

## Known Deferred Release Work

- Legacy `node:test` migration to Vitest is not complete.
- DB integration tests need an isolated Postgres/schema flow.
- Nightly/pre-release regression, accessibility, visual, and performance suites
  are not fully wired.
- Persona-based positive E2E coverage is still a Sprint 3 item.
