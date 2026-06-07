# Testing Strategy

Last refreshed: 2026-06-07.

Current phase: Phase 10 launch readiness is documented. The active context
trail is `docs/testing-context/phase-01-foundation.md` through
`docs/testing-context/phase-10-launch-readiness.md`.

## Quick Start

Use Node 20.x and pnpm 9.x. The project declares the exact expectation in
`.nvmrc`, `package.json`, and CI. Running on Node 22.x can still pass locally,
but pnpm will print an engine warning; final release checks must run on Node
20.18.x.

For everyday work, start here:

```bash
pnpm test
```

Before opening or merging a PR, run:

```bash
pnpm verify
pnpm test:coverage
pnpm test:e2e:smoke
```

Before a release candidate or controlled beta, run:

```bash
pnpm verify
pnpm test:coverage
pnpm test:db
pnpm test:e2e:smoke
pnpm test:e2e:regression
pnpm test:a11y
pnpm test:visual
```

`pnpm test:db` is optional unless `TEST_DATABASE_URL` is configured. Without
that variable it intentionally skips instead of touching an unsafe database.

## Command Reference

| Command                    | What it runs                                                                                       | When to run it                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm test`                | Required Vitest projects: unit, integration, contract, and component tests.                        | Default local check while developing. Run before every PR.                                      |
| `pnpm test:unit`           | Vitest `unit` and `contract` projects in Node.                                                     | After changing pure helpers, auth/RBAC logic, billing logic, DTOs, schemas, or route contracts. |
| `pnpm test:integration`    | Vitest `integration` project, excluding DB tests.                                                  | After changing middleware, route-handler orchestration, server actions, or integration helpers. |
| `pnpm test:component`      | Vitest `component` project in jsdom with React Testing Library.                                    | After changing shared UI primitives, forms, client components, keyboard/focus behavior.         |
| `pnpm test:db`             | Vitest DB migration smoke tests under `tests/integration/db`.                                      | Before release or after migration/repository changes, only with disposable `TEST_DATABASE_URL`. |
| `pnpm test:watch`          | Vitest in watch mode.                                                                              | During focused local development when you want fast re-runs.                                    |
| `pnpm test:coverage`       | Vitest coverage for unit, integration, contract, and component projects.                           | Before PR/release, and after changing critical domains.                                         |
| `pnpm test:e2e:smoke`      | Playwright tests tagged `@smoke`.                                                                  | Before PR/release; checks that key public/protected routes work in a real browser.              |
| `pnpm test:e2e:regression` | Playwright tests tagged `@regression`, forced to one worker.                                       | Before release and after changing user workflows.                                               |
| `pnpm test:a11y`           | Playwright tests tagged `@a11y`.                                                                   | Before release or after changing layout/navigation/focus behavior.                              |
| `pnpm test:visual`         | Playwright tests tagged `@visual`.                                                                 | Before release or after changing visible page layout.                                           |
| `pnpm test:e2e`            | All Playwright tests under `tests/e2e`.                                                            | Manual broad browser run when you intentionally want every browser suite.                       |
| `pnpm test:auth`           | Focused Vitest unit slice for auth and admin unit tests.                                           | Fast loop for auth, RBAC, admin access, and auth redirect changes.                              |
| `pnpm verify`              | `lint`, forbidden vocabulary check, env contract check, build, typecheck, and required Vitest run. | Canonical release gate. Run before PR merge and before release.                                 |
| `pnpm lint`                | Next lint.                                                                                         | Fast static check after changing code style/imports/components.                                 |
| `pnpm typecheck`           | TypeScript `tsc --noEmit`.                                                                         | After TypeScript/API/schema changes, or if build/type errors appear.                            |
| `pnpm build`               | Next production build.                                                                             | Before typecheck if `.next/types` may be stale; always covered by `pnpm verify`.                |
| `pnpm vocab:check`         | Forbidden vocabulary scan.                                                                         | After changing code, copy, docs, prompts, comments, or commit-sensitive text.                   |
| `pnpm env:check`           | Required environment-variable contract check.                                                      | After changing env usage, `.env.example`, or `docs/ENV.md`.                                     |
| `pnpm smoke:routes`        | Scripted route smoke.                                                                              | Manual sanity check for route availability; browser smoke is still the PR gate.                 |

## Which Command Should I Run?

### I changed pure TypeScript logic

Examples: auth helpers, billing state machines, DTO mappers, Zod schemas,
permission checks.

Run:

```bash
pnpm test:unit
pnpm test:coverage
```

If the change is PR-ready, also run `pnpm verify`.

### I changed a React component or form

Examples: shared button/input behavior, member forms, admin form states,
keyboard/focus behavior.

Run:

```bash
pnpm test:component
pnpm test
```

If layout or navigation changed, also run `pnpm test:a11y` and
`pnpm test:visual`.

### I changed middleware, route handlers, or server actions

Examples: protected route redirects, public route DTOs, Stripe webhook handler,
admin exports, server-side validation.

Run:

```bash
pnpm test:integration
pnpm test:unit
pnpm test:e2e:smoke
```

For public routes, verify PII shape through contract tests. Public DTO tests
belong in `tests/contract`.

### I changed database schema, migrations, or repository code

Run:

```bash
pnpm test:db
pnpm test:integration
pnpm verify
```

`pnpm test:db` must point at a disposable database through `TEST_DATABASE_URL`.
The database name must include `test`, `ci`, or `scratch`; tests refuse unsafe
database names.

### I changed a user workflow

Examples: sign-up, onboarding, dashboard, billing, verify-card lookup,
admin/business moderation.

Run:

```bash
pnpm test
pnpm test:e2e:smoke
pnpm test:e2e:regression
```

For release candidates, also run `pnpm test:a11y` and `pnpm test:visual`.

### I only changed docs

Usually no full suite is needed. Run a quick formatting or link sanity check if
the touched document needs it. If the docs changed commands, release gates, env
contracts, or test policy, run:

```bash
pnpm verify
```

## Test Types in This Repo

### Unit tests

Location: `tests/unit/**`

Unit tests prove small pieces of business logic without a browser, network, or
database. They should be fast and deterministic.

Good examples:

- Zod schema accepts valid input and rejects invalid input.
- Billing lifecycle moves from one known state to another.
- Auth redirect helper chooses the right target.
- DTO mapper returns only allowed public keys.

### Integration tests

Location: `tests/integration/**`

Integration tests prove that modules work together. They can test middleware,
route-handler orchestration, server actions, or DB migration smoke. Normal
integration tests do not need a real database; DB tests are isolated under
`tests/integration/db`.

### Contract tests

Location: `tests/contract/**`

Contract tests protect public and security-sensitive boundaries: exact response
shape, PII-safe DTOs, route metadata, observability scrubbers, and admin export
contracts. These tests are important even if line coverage is low.

### Component tests

Location: `tests/component/**`

Component tests run in jsdom with React Testing Library. They should check
behavior that users experience in the component: labels, clicks, validation,
keyboard behavior, loading/error/success states, and focus behavior.

### Browser tests

Location: `tests/e2e/**`

Browser tests run through Playwright. They start a deterministic local Next
server on `PLAYWRIGHT_PORT` or port `3101` by default. The config does not reuse
random existing local servers, so stale apps on port `3000` should not affect
the suite.

Tags decide which browser command runs a test:

- `@smoke`: small PR-safe browser checks.
- `@regression`: broader workflows for release/nightly runs.
- `@security`: security-specific browser assertions, usually run through
  regression.
- `@a11y`: accessibility smoke.
- `@visual`: visual smoke.

## Reading Failures

Start with the first failure, not the longest stack trace.

- Vitest failures usually point to a specific helper, schema, DTO, or contract.
  Fix the behavior or update the test only if the product contract truly
  changed.
- Component failures often mean a label, role, accessible name, or state changed.
  Prefer queries that match what a user can perceive.
- Playwright failures create traces/screenshots on failure in CI. Locally, rerun
  the smallest tagged suite first, then run broader suites only after the small
  one is green.
- Coverage failures should be handled by testing changed behavior, not by adding
  broad exclusions.
- Engine warnings mean the local Node version does not match `20.x`. They are
  warnings locally, but final release evidence must be collected on Node 20.18.x.

## Troubleshooting

### Playwright fails before opening a page

Check whether the local dev server can start:

```bash
pnpm build
pnpm test:e2e:smoke
```

Playwright uses `scripts/playwright-dev-server.mjs` and a dedicated port. If a
custom port is needed:

```bash
$env:PLAYWRIGHT_PORT = "3102"
pnpm test:e2e:smoke
```

### DB tests skip

This is expected unless `TEST_DATABASE_URL` is set. To run DB smoke, point it at
a disposable database only:

```bash
$env:TEST_DATABASE_URL = "postgres://..."
pnpm test:db
```

Do not point tests at production, staging, or a shared developer database.

### Typecheck fails after an interrupted build

Next can leave stale generated types. Rebuild before typecheck:

```bash
pnpm build
pnpm typecheck
```

If `.next` is corrupted, remove only the local `.next` directory and rebuild.

### A test needs network

Default answer: it probably should not. Unit, component, contract, and most
integration tests should use deterministic fixtures or explicit MSW handlers.
Only pre-release/manual provider checks should depend on live external services.

## Current Baseline

- `pnpm test` runs Vitest unit, integration, contract, and component projects.
- There are no remaining legacy `node:test` files under `tests/`.
- `pnpm test:db` provides an opt-in migration integration path through
  `TEST_DATABASE_URL`.
- The component project has a real RTL test path and is no longer scaffold-only.
- Playwright smoke uses deterministic server startup and no longer reuses
  unrelated local servers.
- Playwright has separate scripts for `@smoke`, `@regression`, `@a11y`, and
  `@visual`; PRs run smoke, while scheduled/manual CI runs the broader release
  suites.
- Positive workflow QA currently covers member sign-up/onboarding/dashboard and
  verify-card lookup through `@regression`.
- Repository-wide coverage remains baseline-only; do not add a global 80%
  threshold before critical-domain ratchets are established.

## 1. Purpose

This document defines the maintainable testing system for KCLUB-MVP. It protects
critical product, security, billing, PII, and role-access behavior while keeping
the default developer feedback loop fast.

The strategy applies to existing functionality and is part of the Definition of
Done for every new feature.

## 2. Goals

- Detect regressions before merge and before deployment.
- Keep business rules testable without a browser, network, or production data.
- Verify route access, PII contracts, billing idempotency, and role boundaries.
- Make failures easy to diagnose by testing behavior at the lowest useful level.
- Scale coverage gradually without blocking the foundation migration on an
  unrealistic repository-wide percentage.
- Keep all fixtures deterministic and free of real PII.

Coverage percentage is a guardrail, not the definition of quality. Critical
behavior must have explicit scenario coverage even when line coverage is high.

## 3. Test Layers

| Layer                | Purpose                                                                                | Runner                                  | Default trigger          |
| -------------------- | -------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------ |
| Static gates         | Types, lint, vocabulary, env contract, build                                           | Existing scripts                        | Every PR                 |
| Unit                 | Pure rules, schemas, mappers, state transitions                                        | Vitest `node`                           | Local and every PR       |
| Component            | UI states, forms, keyboard and accessible behavior                                     | Vitest `jsdom` + RTL                    | Local and every PR       |
| Integration          | Route handlers, Server Actions, middleware, DB repositories, external-service adapters | Vitest `node` + MSW + isolated Postgres | Every PR where practical |
| Contract/security    | DTO key sets, authorization matrix, webhook/idempotency, PII rules                     | Vitest and Playwright                   | Every PR                 |
| E2E smoke            | Deployment viability and critical happy paths                                          | Playwright Chromium                     | Every PR after build     |
| E2E regression       | Full role and failure-path workflows                                                   | Playwright                              | Nightly and pre-release  |
| Visual/a11y          | Layout regressions and WCAG checks on critical screens                                 | Playwright screenshots + axe            | Nightly and pre-release  |
| External integration | Stripe CLI/webhook and production-like provider checks                                 | Provider sandbox tools                  | Pre-release/manual gated |
| Performance smoke    | Detect major latency or payload regressions                                            | `oha` or equivalent                     | Nightly and pre-release  |

### Test placement rule

Test behavior at the lowest layer that can prove it:

- A Zod rule belongs in a unit test, not an E2E test.
- A form's validation and keyboard behavior belongs in a component test.
- A role redirect belongs in middleware/guard integration tests.
- A complete member workflow belongs in Playwright.
- External-provider availability is not asserted in normal unit tests.

## 4. Target Tooling and Structure

### Required tools

- Vitest with separate `node` and `jsdom` projects.
- React Testing Library and `user-event` for components.
- MSW for explicit outbound HTTP behavior in Vitest.
- Playwright for browser smoke, regression, visual, and accessibility tests.
- V8 coverage through Vitest.
- GitHub Actions artifacts for coverage and Playwright reports.

All packages must be installed with exact versions and committed with the
lockfile. The selected Vitest configuration must match the pinned major version;
do not use removed options such as `coverage.all` with Vitest v4.

### Target directories

```text
tests/
  unit/
    auth/
    billing/
    business/
    introductions/
    profile/
  component/
    auth/
    admin/
    member/
    ui/
  integration/
    middleware/
    actions/
    routes/
    db/
    external/
  contract/
    pii/
    permissions/
    i18n/
  e2e/
    smoke/
    regression/
    visual/
    a11y/
  fixtures/
    builders/
    personas/
  setup/
    msw/
```

Existing tests may remain in their current domain folders during migration.
New tests use the target directories.

### Naming and tags

- Files: `<behavior>.test.ts[x]` for Vitest and `<workflow>.spec.ts` for
  Playwright.
- Describe tests using observable behavior, not implementation names.
- Playwright suites use tags: `@smoke`, `@regression`, `@security`, `@visual`,
  and `@a11y`.
- A test must not depend on execution order or data created by another test.

## 5. Test Data and Isolation

### Fixtures

- Use fixture builders with safe defaults and explicit overrides.
- Use Faker only with a fixed seed.
- Never use real names, phone numbers, email addresses, Stripe objects, or other
  production PII in fixtures, snapshots, logs, or artifacts.
- Define reusable personas for `FREE`, `VIP`, `BUS`, `ADMIN`, `SUPERADMIN`, and
  `ADMIN_WITHOUT_2FA`.

### Environment and network

- Unit tests run without network and without a database.
- MSW handlers model named success and failure scenarios. Unhandled requests
  fail tests by default; a documented allowlist may use warnings temporarily
  during migration.
- Generic catch-all success handlers for Stripe, Supabase, or Upstash are not
  allowed in the final state because they hide unexpected calls.
- Dev-bypass cookies may test middleware behavior only. Role-aware E2E workflows
  must use deterministic seeded personas or an explicit test-only session
  fixture that is unavailable in production.

### Database integration

- Repository and transaction integration tests use an isolated Postgres
  database or schema created for the test run.
- CI applies the committed Drizzle migrations before DB integration tests.
- Each test cleans only its own records or rolls back its own transaction.
- Tests never run destructive SQL against shared, staging, or production
  databases.

## 6. Coverage Policy

### Initial policy

The foundation phase collects coverage and uploads `lcov`, but does not enforce
an immediate 80% threshold across all `src/**`. The current repository contains
substantial untested server and UI code, so a global threshold would encourage
low-value tests and broad exclusions.

Initial merge gates:

- All migrated/new Vitest tests pass.
- No coverage regression in modules changed by the PR.
- New or materially changed pure business logic targets at least 90% lines and
  85% branches.
- Every new Zod schema has at least one happy-path and one failure-path test.
- Every fixed bug receives a regression test at the lowest useful level.

### Ratchet policy

After the baseline report is stable:

1. Record the repository baseline.
2. Enforce thresholds by critical domain first.
3. Raise thresholds only when the existing suite already meets them reliably.
4. Never lower a threshold or add an exclusion solely to make CI green.

Target thresholds:

| Area                                                   | Lines/functions/statements | Branches |
| ------------------------------------------------------ | -------------------------: | -------: |
| Auth, RBAC, PII DTOs, billing lifecycle, webhook logic |                        90% |      85% |
| Schemas, pure domain helpers, mappers                  |                        90% |      85% |
| Server Actions and route-handler orchestration         |                        80% |      75% |
| Components and presentation helpers                    |                        70% |      60% |
| Repository overall, after migration                    |                        80% |      70% |

Generated files, type declarations, styles, assets, and pure re-export barrels
may be excluded. Server modules and UI modules must not be excluded merely
because they are difficult to test.

## 7. Existing Functionality Coverage Matrix

### Priority P0: security, money, and public PII

| Domain                  | Required coverage                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Phone auth              | Sign-in/sign-up intent separation, unknown/existing phone outcomes, OTP schemas, redirects, read-only session loading           |
| Access control          | Public/member/VIP/BUS/ADMIN/SUPERADMIN matrix, admin 2FA gate, permission overrides, middleware locale and redirects            |
| Verify card             | Allowed DTO key set only, invalid/not-found/rate-limited behavior, no member-data Open Graph reveal, `robots: noindex`          |
| Stripe webhook          | Signature rejection, event idempotency, duplicate delivery, lifecycle transitions, unsupported event, handler failure and retry |
| Checkout reconciliation | Valid/invalid session, membership synchronization, card-number rotation, revalidation behavior                                  |
| Public exports/routes   | Authorization, typed output, no leaked DB-row fields, stable error shape                                                        |

### Priority P1: core product workflows

| Domain                 | Required coverage                                                                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Member dashboard       | Tab routing and aliases, role-gated sections, loading/empty/error states                                            |
| Profile/card           | Validation, read-only User ID, avatar upload failures, card status and tier presentation                            |
| Subscription           | Current plan, invoice history, payment method, cancellation state, auto-pay state, Stripe failure states            |
| Business profile       | Create/validate/submit, moderation statuses, public DTO, top/recommended visibility, slug behavior                  |
| Business Introductions | Eligibility, submit schema, status-transition matrix, admin moderation, audit events                                |
| Admin                  | Admin self-profile route, roles/permissions, user/business management, queue-derived notifications, search, exports |

### Priority P2: broad regression and quality

| Domain            | Required coverage                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------- |
| Public pages      | Route smoke, navigation, directory filters/detail, legal pages                                |
| i18n              | Exact message-key parity, locale routing, no hard-coded user-facing strings in changed UI     |
| Shared UI         | Button/input/dialog/select states, keyboard behavior, focus-visible, 44px target expectations |
| Error handling    | Not-found, global error, network failure, retry and empty states                              |
| Responsive/visual | Member dashboard, club card, directory, admin tables at representative desktop/mobile sizes   |

## 8. Regression Suites

### PR smoke suite

The PR smoke suite is intentionally small and stable. It must complete after the
build and verify:

- Public home and directory open.
- Sign-in and sign-up open.
- Unauthenticated member/admin routes redirect correctly.
- Verify-card not-found response is PII-safe.
- One seeded member can open the member dashboard.
- One seeded admin with 2FA can open the admin dashboard.
- Health of the Stripe webhook route is covered through integration tests, not
  a live provider call.

### Nightly regression suite

Nightly regression runs all Chromium workflows:

- Phone sign-in and sign-up outcomes.
- FREE, VIP, and BUS dashboard differences.
- Business submission and moderation.
- Business Introduction submission and moderation.
- Subscription state and cancellation UI using deterministic Stripe adapters.
- Admin role/permission boundaries.
- Public directory and verify-card contracts.
- Visual and accessibility checks for critical screens.

### Pre-release suite

Before deployment:

- Run the complete `pnpm verify` gate.
- Run the nightly regression suite.
- Run Stripe sandbox/CLI webhook scenarios.
- Apply migrations to an isolated database and run DB integration tests.
- Run performance smoke against a production-like deployment.
- Review Playwright traces/screenshots for any retry or flaky result.

## 9. CI Pipeline

### Required scripts

The legacy `node:test` runner has been retired. Current required scripts:

```text
test:unit          Vitest node project
test:component     Vitest jsdom project
test:integration   Vitest integration project, excluding DB tests
test:db            Optional Vitest DB migration smoke through TEST_DATABASE_URL
test               All required Vitest projects
test:coverage      Vitest coverage collection and threshold checks
test:e2e:smoke     Playwright @smoke on Chromium
test:e2e:regression Playwright @regression
test:a11y          Playwright @a11y
test:visual        Playwright @visual
verify             Lint, vocabulary, env, build, typecheck, and pnpm test
```

`test:db`, `test:e2e:regression`, `test:a11y`, and `test:visual` are not part
of the default `pnpm test` loop. They are scheduled/manual release suites until
the seeded browser data and DB infrastructure are stable enough for every PR.

### Pull request jobs

1. `release-gates`: install, lint, vocabulary, env contract, build, typecheck.
2. `unit-integration`: legacy during migration, Vitest node/jsdom/integration,
   coverage, upload `lcov`.
3. `e2e-smoke`: install Chromium only, run after build/test gates, upload HTML
   report and traces on failure.

CI must use `forbidOnly`, retries only in CI, one worker for stateful E2E until
test isolation is proven, and `trace: on-first-retry`. A test that passes only
after retry is treated as flaky work to fix, not silently accepted.

### Scheduled and release jobs

- Nightly/manual CI: DB migration smoke, regression, visual smoke, and
  accessibility smoke.
- Still deferred: performance smoke, axe-based WCAG scans, true screenshot
  baselines, and external Stripe sandbox checks.

## 10. Definition of Done for New Features

Every feature PR identifies its risk level and adds the corresponding tests.

### Always required

- Happy path and relevant failure paths.
- Regression test for every bug fix.
- Schema happy/failure tests for new or changed validation.
- Authorization test for every protected operation.
- Loading, empty, error, and success states for new asynchronous UI.
- Updated i18n parity tests when messages change.

### Required by feature type

| Feature change             | Minimum required tests                                                        |
| -------------------------- | ----------------------------------------------------------------------------- |
| Pure helper/domain rule    | Unit tests including branches and boundaries                                  |
| Zod schema/form            | Schema unit tests + component validation/submit test                          |
| Server Action              | Auth failure, invalid input, business outcome, typed error, audit side effect |
| Route Handler/public route | Method/auth/status cases + exact response/DTO key contract                    |
| DB query/repository        | Isolated Postgres integration + empty/result/constraint cases                 |
| Protected page/role UI     | Access-matrix integration + one browser smoke path                            |
| External provider adapter  | MSW success/failure/timeout + provider sandbox pre-release check              |
| Critical user workflow     | Playwright happy path + highest-risk failure path                             |
| Shared UI primitive        | Component keyboard/focus/accessibility tests                                  |

The PR description lists added tests and maps them to acceptance criteria.

## 11. Implementation Roadmap

### Phase 0: baseline and inventory

- Keep the existing `tsx --test` suite green.
- Record test count, runtime, and initial coverage report.
- Classify existing tests against the P0/P1/P2 matrix.
- Add `docs/TESTING.md` as the policy source of truth.

Exit criteria: current suite and `pnpm verify` are green; missing P0 scenarios
are tracked.

### Phase 1: non-breaking foundation

- Pin exact Vitest, coverage, RTL, jsdom, MSW, and Playwright versions.
- Add version-correct Vitest node/jsdom projects and Playwright configuration.
- Add strict shared setup, fixture builders, and MSW scenario handlers.
- Introduce parallel `test:legacy` and Vitest scripts.
- Migrate a small representative set: phone auth, middleware, one component,
  and one PII contract.
- Add PR coverage artifact and Chromium smoke job.

Exit criteria: old and new runners pass together; no existing test coverage is
lost; smoke tests are stable in CI.

### Phase 2: P0 coverage and runner migration

- Migrate all existing `node:test` tests to Vitest domain by domain.
- Start the next migration slice with auth and billing.
- Add missing P0 auth, access, verify-card, webhook, reconciliation, and export
  contract tests.
- Add isolated DB integration infrastructure.
- Remove `test:legacy` only after parity is proven.
- Establish the first coverage baseline and critical-domain thresholds.

Exit criteria: all P0 matrix rows are covered and Vitest is the only unit/
integration runner.

### Phase 3: product regression

- Add component coverage for critical forms and shared UI.
- Add seeded persona-based E2E for member, business, and admin workflows.
- Add nightly regression, visual, and accessibility jobs.
- Cover all P1 workflows and highest-risk P2 screens.

Exit criteria: critical workflows are protected at unit/integration/E2E levels
without duplicated low-value assertions.

### Phase 4: continuous hardening

- Ratchet coverage thresholds toward targets.
- Add performance budgets and production-like smoke.
- Track flaky tests, runtime, and repeated escaped regressions.
- Add tests to the nearest existing suite whenever a production issue escapes.

### Current Sprint 0 documentation cleanup

- `docs/RELEASE-ROADMAP.md` is the current release plan.
- `docs/LEGACY-CONTEXT.md` identifies old prompts and sprint notes that are
  historical only.
- Old B16 bootstrap prompt text is no longer the test-system source of truth.

### Current Sprint 1 migration slice

- Auth and billing legacy tests have Vitest parity and no longer run through
  `test:legacy`.
- Business, directory, introductions, i18n, and profile were migrated after the
  auth/billing slice.
- `test:legacy` has been removed from `package.json`.
- `test:auth` is a Vitest command for the auth/admin unit slice.
- Remaining Sprint 1 work: add/expand P0 route contracts where coverage is thin
  and introduce the DB integration path.

## 12. Quality Metrics

Track these monthly:

- Escaped regressions by domain and missing test layer.
- PR smoke and full-suite duration.
- Flaky/retried Playwright tests.
- Coverage trend for P0 domains and changed code.
- Number of production bugs that received a regression test.

Preferred targets after Phase 3:

- PR unit/integration feedback under 5 minutes.
- Entire PR pipeline under 12 minutes.
- Zero accepted flaky P0 tests.
- All P0 public DTOs and protected operations have explicit contract/access
  tests.

## 13. Decisions Replacing the Initial B16 Draft

- The migration is additive; `pnpm test` is not switched to Vitest until legacy
  parity exists.
- Coverage is collected immediately but global 80% enforcement waits for a
  measured baseline.
- MSW does not permanently bypass unhandled requests.
- Dev-bypass cookies test middleware only, not full role-aware workflows.
- Playwright smoke stays small; broad browser regression runs nightly and
  pre-release.
- The full `pnpm verify` release gate remains canonical and continues to run
  build before typecheck.
