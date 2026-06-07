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
pnpm test:e2e:regression
pnpm test:a11y
pnpm test:visual
pnpm verify
```

`pnpm verify` is the canonical release gate. It runs lint, vocabulary check, env
check, build, typecheck, and the combined test suite.

## Test Commands

```bash
pnpm test              # required Vitest projects
pnpm test:unit         # Vitest unit and contract projects
pnpm test:integration  # Vitest integration project
pnpm test:db           # optional migration test against TEST_DATABASE_URL
pnpm test:component    # Vitest jsdom/RTL component project
pnpm test:coverage     # Vitest coverage baseline
pnpm test:e2e:smoke    # Playwright @smoke suite
pnpm test:e2e:regression # Playwright @regression suite
pnpm test:a11y         # Playwright @a11y smoke suite
pnpm test:visual       # Playwright @visual smoke suite
```

The legacy `node:test` runner has been retired. Add new tests to the Vitest
unit, integration, contract, or component projects.

`pnpm test:db` is opt-in and requires `TEST_DATABASE_URL` to point at a
disposable database whose name contains `test`, `ci`, or `scratch`.

## Playwright Smoke

Local Playwright smoke uses a dedicated server flow from `playwright.config.ts`.
If a stale Next process or a different app is already using the configured port,
stop that process before running smoke.

```bash
pnpm test:e2e:smoke
```

CI installs Chromium and uploads `playwright-report` as an artifact.

## Nightly and Pre-Release Suites

Scheduled/manual CI runs the broader release suites without slowing every PR:

```bash
pnpm test:db
pnpm test:e2e:regression
pnpm test:a11y
pnpm test:visual
```

`pnpm test:db` skips unless `TEST_DATABASE_URL` is configured. The current
`@a11y` and `@visual` suites are smoke-level gates; full axe scans and screenshot
baselines remain deferred until those tools and review ownership are pinned.

If a local sandbox already manages the Next server separately, run Playwright
with `PLAYWRIGHT_SKIP_WEB_SERVER=1` and `PLAYWRIGHT_PORT=3101`. Normal local
scripts and CI should let `playwright.config.ts` start the server.

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

- `TEST_DATABASE_URL` needs a CI secret before nightly DB migration smoke can run
  against real Postgres instead of skipping.
- Axe-based accessibility, true visual snapshot baselines, and performance smoke
  are not fully wired.
- Persona-based positive E2E coverage is still a Sprint 3 item.
