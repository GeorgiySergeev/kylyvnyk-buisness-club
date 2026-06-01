# B16-testing-qa

## Title

Testing & QA — strategy and scope

## Objective

Define a pragmatic testing scope for MVP that protects critical flows with minimal maintenance cost.

## Scope

- Unit: schema/validators, pure utils, server actions’ edge cases.
- Component: form controls, badges, cards, empty/loading states.
- E2E: auth sign-in, VIP checkout trigger (redirect to Stripe), verify-card page.
- Integration: Stripe webhooks via Stripe CLI; migration smoke in CI.
- Quality gates: lint, typecheck, unit, build; basic performance smoke.

## Tools

- Vitest + React Testing Library (component/unit)
- Playwright (E2E)
- Stripe CLI (webhooks integration)
- GitHub Actions (CI)
- oha/autocannon (optional perf smoke)

## Execution order

| Step | File | Notes |
| ---- | ---- | ----- |
| **0** | **`06-tests-foundation-init-pr.md`** | **Run first** — Vitest (node/jsdom), MSW, Playwright `/en/admin` smoke, CI coverage + E2E |
| 1 | `01-vitest-rtl-setup.md` | Superseded for bootstrap by step 0; use for additional RTL component tests |
| 2 | `02-playwright-auth-checkout-verifycard.md` | Extended E2E flows after foundation |
| 3 | `03-stripe-cli-mocks-webhook-tests.md` | Webhook integration |
| 4 | `04-ci-lint-type-checks.md` | Extra CI gates (after step 0 baseline) |
| 5 | `05-minimal-load-smoke.md` | Optional perf smoke |

Alias: `tests/test-plan-init-pr.md` → step 0.
