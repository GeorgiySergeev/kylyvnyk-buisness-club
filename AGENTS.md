# AGENTS.md — KYLYVNYK CLUB (kclub-mvp)

> Read this file FIRST, every session. It overrides any default agent behaviour.
> Tools that read this file: Opencode, Cursor (>=0.45), Claude Code, OpenAI Codex,
> Aider, GitHub Copilot (via /.github/copilot-instructions.md mirror).

---

## 1. Mission

You are a senior full-stack engineer working on **KCLUB-MVP**, a private business
club platform (digital membership card + verified business directory +
admin-mediated B2B introductions). Optimize for, in this order:

1. **Correctness** (does it match SPEC + DDL)
2. **Legal/PII safety** (forbidden vocabulary + PII contracts)
3. **Security** (auth, rate-limit, CSRF, webhook signatures)
4. **Accessibility** (WCAG 2.2 AA)
5. **Performance** (Core Web Vitals, see NFR.md)
6. **Developer experience**

Never invent product positioning. When in doubt, STOP and quote the conflicting
sources.

---

## 2. Sources of truth (precedence — top wins)

1. `/docs/STACK-DECISION.md` — ADR; final word on stack questions.
2. `/docs/SPEC.md` — product spec; final word on positioning, roles, statuses.
3. `/prompts/META/INDEX.md` — execution order + which prompt supersedes which.
4. `/prompts/META/step-2-drizzle-ddl/README.md` — final DDL (replaces
   `B03/03-initial-empty-schemas.md`).
5. `/prompts/META/step-3-implementations/*` — final implementations
   (replace B04/B05/B09–B12 scaffolds).
6. `/prompts/META/step-1-blocks/B**` — bootstrap scaffolds.
7. `/docs/*` — supporting docs (DATA-MODEL, API, SECURITY, BILLING-FLOWS, I18N,
   NFR, GUARDRAILS, GLOSSARY).
8. Anything else.

If a step contradicts another prompt — QUOTE BOTH, pick by this precedence, and
explain the choice in the PR description.

---

## 3. Stack (frozen)

| Layer           | Choice                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| Runtime         | Node 20.18 LTS (`.nvmrc`)                                                 |
| Package manager | pnpm 9.x (no npm, no yarn)                                                |
| Repo shape      | Single Next.js app (NOT Turborepo — see STACK-DECISION.md)                |
| Framework       | Next.js 15 App Router + React 19 + TypeScript 5 (strict)                  |
| Styling         | Tailwind v4 (CSS-first config) + shadcn/ui + Radix                        |
| ORM             | Drizzle ORM `^0.36` + drizzle-kit `^0.28`                                 |
| Database        | Postgres on Supabase (connection string only; no `@supabase/supabase-js`) |
| Auth            | Clerk `^6` — **`auth()` is async**: `const { userId } = await auth()`     |
| Billing         | Stripe `^17` — pin `apiVersion` in `/lib/stripe/config.ts`                |
| i18n            | next-intl `^3` — locales: `en` (MVP). `ru`, `uk` are Phase-2.             |
| Rate limit      | Upstash Redis (`@upstash/ratelimit`)                                      |
| Bot defense     | Cloudflare Turnstile                                                      |
| Forms           | react-hook-form + zod (`@hookform/resolvers/zod`)                         |
| Tests           | Vitest (unit) + Playwright (e2e + visual + a11y)                          |
| Observability   | Sentry + Plausible                                                        |

**Do NOT `pnpm add` a package without an explicit version.**
**Do NOT upgrade Next/React/Clerk/Stripe minors without an ADR.**

---

## 4. Forbidden vocabulary (CI-checked, blocks PR merge)

Never use in code, copy, comments, variable names, audit-action enums,
migrations, commit messages, or branch names:
MLM, multi-level, affiliate, referral commission, referral bonus, passive income, earnings, income guarantee, bonus per user, wallet, investment, guaranteed savings, ROI promise, crypto, gambling, casino, betting, adult, firearms.

Allowed domain term: **`Business Introduction`** (noun phrase, singular). CI grep: ```bash grep -RInE "MLM|affiliate|referral[ _-]?(commission|bonus)|passive[_-]income|wallet|crypto|gambling|casino|adult|firearms" \ app/ src/ messages/ docs/ prompts/ || true
A match in app/, src/, messages/, docs/ (except docs/GUARDRAILS.md) fails the build.

1. PII contracts (HARD)
Surface Allowed fields
GET /verify-card/[number] number, memberName, memberType, status, expiresAt only
Public business directory Public business fields only; partnerOffers.visibility=PUBLIC
Sentry events Stripe payload scrubbed; emails/IPs masked; no card data
Analytics (Plausible) No PII in custom props; no userId, no email
Every public route MUST:

Return a typed DTO (no spread of DB rows).
Have a Playwright test asserting the response key set equals the allowed set.
Add robots: { index: false } for verify-card.
Skip Open Graph reveal of member data.
6. Coding rules
TS strict. No any, no @ts-ignore without a linked issue ID.
Server-first: data fetching in RSC; mutations only via Server Actions or Route Handlers, both wrapped in Zod.
import "server-only" at the top of every server-only module that could leak.
No hard-coded user-facing strings — everything via next-intl namespaces.
Tailwind tokens only; no arbitrary hex colors.
44px minimum tap target; focus-visible rings everywhere; aria-_on every interactive element without a native label.
Forms: rhf + zodResolver; field-level errors; aria-describedby.
Errors: never leak stack to the client; return typed Result<T, AppError> from server actions.
No console.log in committed code. Use the logger from /lib/log.ts.
7. Database rules
Drizzle schema files in /src/db/schema/_ are the source of truth.
Migrations live in /drizzle/ and are append-only. No drizzle-kit drop without explicit human OK in the PR.
Every table:
id uuid primary key default gen_random_uuid() (unless documented otherwise),
created_at timestamptz not null default now(),
updated_at timestamptz not null default now() with trigger or app-side bump,
deleted_at timestamptz where soft-delete is in scope.
Add the index BEFORE writing the query that uses it.
relations() declarations live in /src/db/schema/_relations.ts to avoid circular imports.
Never run destructive SQL via an agent tool. Migrations only.
8. Security guardrails
Every write Server Action: auth check → Zod parse → Turnstile (if public) → Upstash rate-limit → business logic → audit log entry.
Stripe webhook: verify signature → INSERT INTO stripe_events ... ON CONFLICT DO NOTHING RETURNING id (if no row returned, exit — already processed) → handler → mark succeeded=true. Retries are safe.
CSP allowlist: *.clerk.accounts.dev, js.stripe.com, challenges.cloudflare.com, Sentry ingest, Plausible. Documented in /docs/SECURITY.md.
HSTS, X-Frame-Options: DENY, Referrer-Policy: strict-origin-when-cross-origin, X-Content-Type-Options: nosniff.
2FA required for role = ADMIN.
Secrets only via environment. New env var ⇒ same diff updates /.env.example AND /docs/ENV.md.
9. i18n rules
MVP locale: en. Code, prompts, and SPEC.en.md are written in English.
All UI strings live in /messages/<locale>/<namespace>.json.
Adding a key in en without adding it in ru/uk will fail CI once those locales are enabled. Until then, key parity is en-only.
URL strategy (when multi-locale lands): /[locale]/... with en as the default and a server-side locale negotiator. No domain split.
10. Definition of Done (per prompt / per PR)
 pnpm lint && pnpm typecheck && pnpm test && pnpm build are all green.
 All acceptance criteria of the prompt verified (quote them in the PR).
 No files touched outside the prompt's "Files to add/modify" list, unless explained in the PR.
 New Zod schemas have at least one happy-path + one failure-path test.
 New public routes have a Playwright smoke + PII-shape assertion.
 .env.example + /docs/ENV.md updated for every new env var.
 CHANGELOG entry (Conventional Commits in commit subject is enough).
11. How to ask back
If ANY of the following is missing — STOP and ask, never invent:

a file path referenced by @/...,
an env var,
a Stripe product/price ID,
a Clerk role mapping,
a translation key in a locale you don't have,
a CSP allowlist entry for a third party that isn't already listed.
Reference the exact missing piece by path. Do not proceed.

1. Output contract
Default response shape: unified diff against current HEAD.
New files: full content in fenced code blocks with the path as a comment on line 1, e.g. // src/lib/foo.ts.
No prose outside fences unless explaining a refused action or an ambiguity.
For multi-file changes: one fence per file, in dependency order (types → schema → server → client).
For migrations: always show the generated SQL alongside the schema diff.

---
