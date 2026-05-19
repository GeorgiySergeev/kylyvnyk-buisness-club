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
