# CODEX.md — KCLUB MVP

> Codex CLI reads this file before every session.
> This file is a Codex-specific adapter for /AGENTS.md.
> When this file and AGENTS.md conflict — AGENTS.md wins.

---

## Quick orientation

Project: **KCLUB-MVP** — private business club platform.
8 MVP pages: home (public/auth), sign-up/onboarding, dashboard,
business directory, business card page, "recommend a client" form,
MVP admin panel. **Stripe is NOT part of MVP.**

Full context: read `/AGENTS.md` (required), then
`/prompts/META/INDEX.md`, then `/docs/STACK-DECISION.md`.

---

## Codex session startup sequence (mandatory)

Run this mentally before every session:

```
1. Read /AGENTS.md                        → master rules
2. Read /prompts/META/INDEX.md            → execution order + patches
3. Read /docs/STACK-DECISION.md           → frozen stack (10 ADRs)
4. Read /docs/DESIGN.md                   → if touching UI
5. Read /docs/RUNBOOK.md §2               → daily commands cheat sheet
6. Check: are there uncommitted changes?  → git status
   If yes — ask user before proceeding.
```

---

## Codex-specific behaviour

### Approval mode recommendations

| Mode        | When to use                                                | Risk             |
| ----------- | ---------------------------------------------------------- | ---------------- |
| `suggest`   | Schema changes, migrations, security code, AGENTS.md edits | Low              |
| `auto-edit` | Regular feature work (components, actions, queries)        | Medium — default |
| `full-auto` | Only inside Docker sandbox, never against real DB          | High             |

**Default for KCLUB:** `auto-edit`.
Never use `full-auto` against a real Supabase DB.

### Output format

- Default: **unified diff** per file, in dependency order.
- New files: full content, path as first-line comment.
- After every multi-file change: suggest the verification command.
- Never output more than 12 files in one response.

### When to stop and ask

Stop immediately if:

- A referenced file (`@/db/schema/...`, `@/lib/stripe/...`) does not exist.
- An env var appears in code but is not in `.env.example`.
- A prompt's `Inputs` precondition is not met.
- The task requires `pnpm add <package>` — ask for name + version confirmation.
- Migration SQL contains `DROP`, `TRUNCATE`, or `DELETE` — always confirm.

---

## Stack (frozen, see STACK-DECISION.md for ADRs)

```
Next.js 15  React 19  TypeScript 5 strict
Tailwind v4 (CSS-first)  shadcn/ui  Radix
Drizzle ORM ^0.36  Postgres on Supabase (connection string only)
Clerk ^6  (auth() IS ASYNC — always await auth())
next-intl ^3  locales: ['en']
Upstash Redis  Cloudflare Turnstile
Node 20.18 LTS  pnpm 9.15
Stripe: NOT in MVP
```

---

## Forbidden vocabulary (blocks commit)

```
MLM | affiliate | referral commission | referral bonus |
passive income | earnings | income guarantee | bonus per user |
wallet | investment | guaranteed savings | ROI promise |
crypto | gambling | casino | betting | adult | firearms
```

Allowed: **Business Introduction** (singular noun phrase only).

CI greps `app/`, `src/`, `messages/`, `prompts/` — a match fails the build.

---

## PII hard contracts

`GET /verify-card/[number]` returns EXACTLY:
`number, memberName, memberType, status, expiresAt` — nothing else.
Every public route has a Playwright test asserting the key set.

---

## Definition of Done (every task)

```
[ ] pnpm lint && pnpm typecheck && pnpm test:run && pnpm build → green
[ ] No files touched outside the stated scope
[ ] New env vars → .env.example + docs/ENV.md updated
[ ] New public routes → PII-shape Playwright assertion added
[ ] Forbidden vocab grep → clean
```
