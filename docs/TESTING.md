# Testing Strategy

Last refreshed: 2026-06-06.

Current phase: Phase 07 DB path and route contracts is in progress. The active context trail is
`docs/testing-context/phase-01-foundation.md` through
`docs/testing-context/phase-07-db-path-route-contracts.md`.

Sprint 0 baseline:

- `pnpm test` runs Vitest unit, integration, contract, and component projects.
- There are no remaining legacy `node:test` files under `tests/`.
- `pnpm test:db` provides an opt-in migration integration path through
  `TEST_DATABASE_URL`.
- The component project has a real RTL test path and is no longer scaffold-only.
- Playwright smoke uses deterministic server startup and no longer reuses
  unrelated local servers.
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

| Layer | Purpose | Runner | Default trigger |
| --- | --- | --- | --- |
| Static gates | Types, lint, vocabulary, env contract, build | Existing scripts | Every PR |
| Unit | Pure rules, schemas, mappers, state transitions | Vitest `node` | Local and every PR |
| Component | UI states, forms, keyboard and accessible behavior | Vitest `jsdom` + RTL | Local and every PR |
| Integration | Route handlers, Server Actions, middleware, DB repositories, external-service adapters | Vitest `node` + MSW + isolated Postgres | Every PR where practical |
| Contract/security | DTO key sets, authorization matrix, webhook/idempotency, PII rules | Vitest and Playwright | Every PR |
| E2E smoke | Deployment viability and critical happy paths | Playwright Chromium | Every PR after build |
| E2E regression | Full role and failure-path workflows | Playwright | Nightly and pre-release |
| Visual/a11y | Layout regressions and WCAG checks on critical screens | Playwright screenshots + axe | Nightly and pre-release |
| External integration | Stripe CLI/webhook and production-like provider checks | Provider sandbox tools | Pre-release/manual gated |
| Performance smoke | Detect major latency or payload regressions | `oha` or equivalent | Nightly and pre-release |

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

| Area | Lines/functions/statements | Branches |
| --- | ---: | ---: |
| Auth, RBAC, PII DTOs, billing lifecycle, webhook logic | 90% | 85% |
| Schemas, pure domain helpers, mappers | 90% | 85% |
| Server Actions and route-handler orchestration | 80% | 75% |
| Components and presentation helpers | 70% | 60% |
| Repository overall, after migration | 80% | 70% |

Generated files, type declarations, styles, assets, and pure re-export barrels
may be excluded. Server modules and UI modules must not be excluded merely
because they are difficult to test.

## 7. Existing Functionality Coverage Matrix

### Priority P0: security, money, and public PII

| Domain | Required coverage |
| --- | --- |
| Phone auth | Sign-in/sign-up intent separation, unknown/existing phone outcomes, OTP schemas, redirects, read-only session loading |
| Access control | Public/member/VIP/BUS/ADMIN/SUPERADMIN matrix, admin 2FA gate, permission overrides, middleware locale and redirects |
| Verify card | Allowed DTO key set only, invalid/not-found/rate-limited behavior, no member-data Open Graph reveal, `robots: noindex` |
| Stripe webhook | Signature rejection, event idempotency, duplicate delivery, lifecycle transitions, unsupported event, handler failure and retry |
| Checkout reconciliation | Valid/invalid session, membership synchronization, card-number rotation, revalidation behavior |
| Public exports/routes | Authorization, typed output, no leaked DB-row fields, stable error shape |

### Priority P1: core product workflows

| Domain | Required coverage |
| --- | --- |
| Member dashboard | Tab routing and aliases, role-gated sections, loading/empty/error states |
| Profile/card | Validation, read-only User ID, avatar upload failures, card status and tier presentation |
| Subscription | Current plan, invoice history, payment method, cancellation state, auto-pay state, Stripe failure states |
| Business profile | Create/validate/submit, moderation statuses, public DTO, top/recommended visibility, slug behavior |
| Business Introductions | Eligibility, submit schema, status-transition matrix, admin moderation, audit events |
| Admin | Admin self-profile route, roles/permissions, user/business management, queue-derived notifications, search, exports |

### Priority P2: broad regression and quality

| Domain | Required coverage |
| --- | --- |
| Public pages | Route smoke, navigation, directory filters/detail, legal pages |
| i18n | Exact message-key parity, locale routing, no hard-coded user-facing strings in changed UI |
| Shared UI | Button/input/dialog/select states, keyboard behavior, focus-visible, 44px target expectations |
| Error handling | Not-found, global error, network failure, retry and empty states |
| Responsive/visual | Member dashboard, club card, directory, admin tables at representative desktop/mobile sizes |

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

The migration keeps the legacy runner until all existing tests are moved:

```text
test:legacy        Existing tsx --test suite during migration
test:unit          Vitest node project
test:component     Vitest jsdom project
test:integration   Vitest integration/contract projects
test               Legacy + all required Vitest projects during migration
test:coverage      Vitest coverage collection and threshold checks
test:e2e:smoke     Playwright @smoke on Chromium
test:e2e:regression Playwright @regression
test:a11y          Playwright @a11y
test:visual        Playwright @visual
verify             Existing release gates + required test and smoke suites
```

`test:legacy` is removed only after every existing `node:test` file has an
equivalent Vitest test and both suites have passed together.

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

- Nightly: regression, visual, accessibility, DB integration, performance smoke.
- Pre-release/manual dispatch: external Stripe sandbox checks and full release
  suite.

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

| Feature change | Minimum required tests |
| --- | --- |
| Pure helper/domain rule | Unit tests including branches and boundaries |
| Zod schema/form | Schema unit tests + component validation/submit test |
| Server Action | Auth failure, invalid input, business outcome, typed error, audit side effect |
| Route Handler/public route | Method/auth/status cases + exact response/DTO key contract |
| DB query/repository | Isolated Postgres integration + empty/result/constraint cases |
| Protected page/role UI | Access-matrix integration + one browser smoke path |
| External provider adapter | MSW success/failure/timeout + provider sandbox pre-release check |
| Critical user workflow | Playwright happy path + highest-risk failure path |
| Shared UI primitive | Component keyboard/focus/accessibility tests |

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
