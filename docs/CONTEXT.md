# Pinned Context Header — copy/paste (.md)

Ниже два готовых варианта: Full и Ultra-short. Замените плейсхолдеры в <> на актуальные значения перед отправкой промпта в новом чате.

---

## Full (рекомендуется)

````md
# KCLUB-MVP — Pinned Context Header

- Context-ID: KCLUB/2026-05-19/ddl-v1.0-mvp/commit-<COMMIT_SHA>
- Project: KYLYVNYK CLUB (KCLUB-MVP)
- Repo: <REPO_URL>, Branch: <BRANCH>, Commit: <COMMIT_SHA>
- Schema: drizzle-ddl v1.0-mvp (last updated: 2026-05-19)
- Stack: Next.js 15 (App Router), TypeScript, Tailwind + shadcn/ui, Drizzle (Postgres), Clerk, Stripe, Cloudflare Turnstile, Upstash Redis, next-intl (en)
- Policies & guardrails:
  - No MLM/affiliate/income claims.
  - High-risk categories forbidden: crypto, gambling, adult, firearms, unlicensed finance, high-risk investments.
  - Public PII restriction (Verify Card): only memberName, number, status, memberType, expiresAt.
  - Legal footer inserts mandatory on public pages.
- Modules baseline: Auth/RBAC (Clerk), Billing (Stripe), Catalog (PUBLISHED-only), Digital Card + /verify-card/:number, Admin moderation, Security (CSP, Turnstile, rate-limit), i18n (en), Sentry + Plausible.

# Block & Step (to fill per request)

- Block: B<##> — <Block name>
- Step: S<0#> — </prompts/... file name>

# Goal

<1–3 bullets of what to produce>

# Scope

- In: <…>
- Out: <…>

# Files to touch (ordered)

- create: <paths>
- modify: <paths>
- remove: <paths>

# Existing code excerpts

// file: <path> (ANCHOR-1)

```tsx
// START:anchor-1
<only relevant fragment 30–120 lines>
// END:anchor-1
```
````

# Contracts/DB

- Tables/Enums used: <list minimal: columns, enum values>
- API routes used: </api/... signature and payloads>

# Conventions & Constraints

- Server Actions/RSC; no secrets on client.
- Black & Gold tokens; focus-visible rings; 44px targets.
- next-intl for public strings.

# Output format

- Prefer: unified diff (patch). If creating new files — full file in code fences.
- No extra prose outside code fences.

# Acceptance criteria

- pnpm build/lint/typecheck pass.
- Route/command to smoke-test works: <…>
- Policy compliance maintained (no PII leaks, no high-risk, no MLM language).

# Ask-back

If any file/excerpt/env/ID is missing — ask before generating code.

````

---

## Ultra-short (для быстрых задач)

```md
# KCLUB-MVP — Pinned

Context-ID: KCLUB/2026-05-19/ddl-v1.0-mvp/commit-<SHA>
Repo/Branch: <REPO_URL>#<BRANCH>@<SHA>
Schema: drizzle-ddl v1.0-mvp (2026-05-19)
Stack: Next15/TS/TW+shadcn/Drizzle/Clerk/Stripe/Turnstile/Upstash/next-intl
Policies: no-MLM, no high-risk, PII-safe verify-card, legal footer

Block/Step: B<##> S<0#> — </prompts/...>

Goal: <…>

Files: create <…>; modify <…>

Excerpts:
```tsx
// file: <path> (ANCHOR)
<only relevant lines>
````

Output: unified diff (or full files in code fences)
Acceptance: build/lint/types OK; route works; policies OK
Ask-back allowed if context is missing

```

---

Замечания
- Дату и версию схемы можете оставить как v1.0-mvp (2026-05-19) до следующей правки DDL; при изменениях повышайте минор: v1.1, v1.2, …
- Context-ID повторяйте в каждом чате — это “нитка” для привязки ко времени/схеме/коммиту.
- В Excerpts вставляйте только релевантные куски (30–120 строк) и используйте якоря START/END, чтобы ассистент правил точечно.
```
