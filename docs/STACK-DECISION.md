# STACK-DECISION — Architecture Decision Record

> Status of this document: **ACCEPTED, 2026-05-20**.
> Owner: tech lead.
> Supersedes: any conflicting wording in `docs/SPEC.md`, original product
> brief, and any individual prompt under `prompts/META/`.
> Referenced by: `/AGENTS.md §2`, every prompt's `Inputs` section.

This file is the single source of truth for stack questions. When `SPEC.md`
or a prompt disagrees with this file, **this file wins** and the other one
gets a follow-up PR to align.

Each ADR below is independently revisable. To change one, open a PR titled
`adr: revise ADR-NNN` with a new "Status: SUPERSEDED by ADR-XXX" line
appended to the old ADR. Never edit an accepted ADR in place — append.

---

## Index

| ID      | Decision                                                                    | Status                |
| ------- | --------------------------------------------------------------------------- | --------------------- |
| ADR-001 | Application framework: Next.js 15 + React 19 + TypeScript 5 strict          | ACCEPTED              |
| ADR-002 | Repo shape: single Next.js app, **NOT** Turborepo                           | ACCEPTED              |
| ADR-003 | Database: Postgres on Supabase via connection string + Drizzle ORM          | ACCEPTED              |
| ADR-004 | Authentication: Clerk v6 (not Supabase Auth)                                | SUPERSEDED by ADR-011 |
| ADR-005 | Billing: Stripe v17 with pinned `apiVersion`                                | ACCEPTED              |
| ADR-006 | Localization: `en` only at MVP launch; `ru`, `uk` are Phase-2               | SUPERSEDED by ADR-013 |
| ADR-007 | Membership lifecycle: one active row per (user, type); history in audit_log | ACCEPTED              |
| ADR-008 | Bot defense + rate limiting: Cloudflare Turnstile + Upstash Redis           | ACCEPTED              |
| ADR-009 | Observability: Sentry (errors) + Plausible (privacy-first analytics)        | ACCEPTED              |
| ADR-010 | Deployment: Vercel (production + previews); Supabase managed Postgres       | ACCEPTED              |
| ADR-011 | Authentication: Supabase Auth phone-first                                   | ACCEPTED              |
| ADR-012 | UI component layer: daisyUI adapter on top of Tailwind/shadcn               | ACCEPTED              |

---

## ADR-001 — Application framework

### Context

The product is a content-heavy directory + transactional flows (sign-up,
checkout, card verification, admin moderation). It must be fast on mobile,
SEO-friendly, and shippable by a small team within an MVP timeframe.

The brief named "Next.js 15 + React 19 + TypeScript 5 strict + Tailwind v4".
The existing prompts (`B01-project-bootstrap`) already scaffold exactly that.
The question was whether to lock those versions or remain on "latest".

### Decision

Lock to:

- `next@15.x` (App Router, RSC by default)
- `react@19.x`
- `typescript@5.x` with `"strict": true`, `"noUncheckedIndexedAccess": true`,
  `"exactOptionalPropertyTypes": true`
- `tailwindcss@4.x` (CSS-first config in `app/globals.css`)
- `shadcn/ui` components (copied into `/src/components/ui`, not imported from
  a registry — keeps us patchable)

Exact versions live in `package.json`. Minor bumps are mechanical (Renovate
PRs). Major bumps require a new ADR.

### Alternatives considered

- **Remix / React Router 7.** Smaller ecosystem for what we need; weaker RSC
  story for SEO-heavy pages.
- **Astro + islands.** Excellent for the marketing surface, awkward for the
  member/admin areas. Rejected to avoid a split stack.
- **Plain SPA + separate API.** Worse SEO, more infrastructure to run.

### Consequences

- One framework end-to-end; one router, one auth integration, one deploy target.
- RSC reduces client JS for marketing and directory pages.
  − Bleeding edge: Next 15 + React 19 + Tailwind v4 + shadcn/ui interop is
  weeks-old at decision time. Mitigation: pin exact versions, Renovate,
  weekly upgrade window, "known issues" log under `/docs/KNOWN-ISSUES.md`.

---

## ADR-002 — Repo shape

### Context

The brief mentioned "Turborepo + pnpm workspaces". The prompts in
`prompts/META/` assume a single Next.js app at the repo root. The question
was whether to monorepo from day 1.

A monorepo pays off when you have ≥ 2 deployables that share code (e.g. a
mobile app, a separate API, a worker, a shared design system used by an
external partner). KCLUB-MVP has exactly one deployable.

### Decision

**Single Next.js app at the repo root.** No Turborepo. No
`pnpm-workspace.yaml`. `pnpm` is still the package manager (`packageManager`
field in `package.json` pins the version).

We may revisit if/when we add:

- a mobile app (React Native / Expo),
- a standalone admin SPA,
- a long-running worker that can't live as a Vercel cron / function.

Until then, "shared code" goes into `/src/lib/*` or `/src/features/*`.

### Alternatives considered

- **Turborepo with `apps/web` + `packages/db` + `packages/ui`.** Adds build
  graph complexity, two `tsconfig.json` layers, workspace-aware tooling.
  Pure overhead for one deployable. Rejected.
- **Nx.** Same reasoning, heavier.
- **Single app but with `pnpm-workspace.yaml` for future-proofing.** Rejected:
  workspaces without packages just confuse tooling.

### Consequences

- Simpler `pnpm install`, simpler CI, simpler Vercel build.
- `tsconfig.json` paths resolve cleanly with `@/*` → `src/*`.
  − If a mobile app appears, we will need to extract `packages/db` and
  `packages/types` then. Cost estimate: 1–2 days of refactor. Acceptable.

---

## ADR-003 — Database layer

### Context

We need Postgres for transactional data, full-text-ish search on businesses
(initially `ILIKE`/`pg_trgm`, later possibly Meilisearch), and audit logs.
The brief said "Supabase Postgres". The prompts use Drizzle ORM.

Two real options:

1. **Supabase + `@supabase/supabase-js`** — RLS-driven, REST/PostgREST-ish
   client, tight integration with Supabase Auth.
2. **Supabase Postgres via connection string + Drizzle** — treat Supabase as
   a managed Postgres provider only; ignore the rest of the platform.

### Decision

Option 2. Use Supabase **only** as managed Postgres (and as backup +
point-in-time recovery). All data access goes through Drizzle ORM over a
direct connection string. We do **not** install `@supabase/supabase-js`.

Connection details:

- Pooled connection (PgBouncer) via Supabase's connection pooler for serverless.
- Driver: `postgres` (postgres-js) with **`prepare: false`** when going
  through PgBouncer transaction mode. Without this, prepared statements
  break unpredictably.
- Direct connection only for `drizzle-kit` migrations (which need session
  mode for `CREATE TYPE` etc.). Two env vars:
  - `DATABASE_URL` — pooled, used by the app at runtime.
  - `DATABASE_URL_DIRECT` — direct, used by `drizzle-kit` only.

Schema source of truth: `/src/db/schema/*.ts`. Relations live in
`/src/db/schema/_relations.ts` (see Patch-05). Migrations are append-only
under `/drizzle/`.

### Alternatives considered

- **Supabase Auth + RLS as the entire authorization model.** Powerful but
  ties us to Supabase forever, splits business logic between SQL policies
  and TypeScript code, and makes admin tooling painful. Rejected (see
  ADR-004 for the auth side).
- **Prisma instead of Drizzle.** Heavier runtime, weaker raw-SQL escape
  hatches, worse experience with Postgres-specific features (enums,
  generated columns, `tstzrange`). Drizzle gives us better SQL fidelity
  and smaller runtime.
- **Neon / Railway / RDS instead of Supabase.** Comparable for Postgres
  alone, but Supabase gives us free backups + dashboard for low MVP
  traffic with zero ops effort.

### Consequences

- Portable: if Supabase pricing or reliability disappoints, swap the
  connection string. No vendor lock-in beyond Postgres dialect.
- One language (TypeScript) for all data access; one place to read schema.
  − We give up RLS as a defense-in-depth layer. Mitigation: every public
  surface returns through a typed DTO with an explicit field allowlist,
  enforced by Playwright assertion tests (see `AGENTS.md §5`).
  − We must ourselves remember `prepare: false` for the pooled URL. Documented
  in `/docs/RUNBOOK.md`.

---

## ADR-004 — Authentication

> Status: SUPERSEDED by ADR-011, 2026-05-23.

### Context

The brief mentioned both Clerk (in the prompt library) and Supabase Auth (in
the original engineering notes). They are not equivalent. Pick one.

KCLUB needs:

- Email/password + Google OAuth (likely later: Apple, LinkedIn).
- Server-side session resolution in RSC and Server Actions.
- 2FA for admins.
- Webhook-driven sync of users to our DB (so Drizzle is the source of truth
  for "who is a paying member", separate from "who has an auth identity").
- A solid pre-built UI for sign-in / sign-up / account management to avoid
  burning weeks on auth UI for an MVP.

### Decision

**Clerk v6.** Specifically:

- `@clerk/nextjs@^6`.
- Middleware-based auth (`/src/middleware.ts`).
- `auth()` is **async** in v6 — always `await auth()`. Patch-01 enforces this.
- Clerk holds the identity (email, password hash, OAuth tokens, 2FA).
- A `users` row in our Postgres mirrors each Clerk user, keyed by
  `clerk_user_id`. Sync via Clerk webhooks (`user.created`, `user.updated`,
  `user.deleted`) into `app/api/clerk/webhook/route.ts`.
- Roles (`FREE | VIP | BUSINESS | ADMIN`) live in **our** DB, not in Clerk
  `publicMetadata`. Clerk metadata is mirrored to our DB on webhook, but
  the authoritative source is our `users.role` column.
- 2FA is enforced for `role = ADMIN` via a middleware check that calls
  `await clerkClient.users.getUser(userId)` and reads `twoFactorEnabled`.

### Alternatives considered

- **Supabase Auth.** Comparable feature set, deeply tied to RLS (which we
  rejected in ADR-003). Self-hosting account UI is more work. Rejected.
- **Auth.js (NextAuth).** Maximally flexible, but we own everything:
  email verification, password reset, 2FA UI, OAuth provider quirks. Too
  much undifferentiated work for an MVP.
- **Lucia.** Same problem as Auth.js plus a smaller ecosystem.

### Consequences

- Auth UI ships in days, not weeks.
- 2FA, password policies, OAuth, email deliverability are Clerk's problem.
- Clear identity-vs-authorization split: Clerk owns identity, our DB owns
  roles and memberships.
  − Vendor lock-in on auth. Mitigation: webhook-synced mirror means we always
  have email + provider data in our DB; migrating to another provider later
  costs us a re-login event for every user, not data loss.
  − CSP must allow `*.clerk.accounts.dev` and Clerk's frontend domains.
  Documented in `/docs/SECURITY.md`.

---

## ADR-011 — Authentication: Supabase Auth phone-first

### Context

The product now needs a simplified member entry flow: phone number first, no
password on the first screen, and optional profile data later in onboarding.
This intentionally supersedes ADR-004.

### Decision

Use Supabase Auth for identity and SMS OTP sessions.

- `@supabase/ssr` manages auth cookies in middleware, Server Actions, and
  Server Components.
- `@supabase/supabase-js` is allowed only through Supabase Auth/SSR helpers.
  Product data remains Drizzle over `DATABASE_URL`.
- `/[locale]/sign-in` is the single phone-first auth page. `/[locale]/sign-up`
  redirects there.
- Successful first phone auth creates a `users` row with `role = FREE`,
  `status = ACTIVE`, `phone`, and `supabase_user_id`.
- `users.role` remains the authorization source of truth.
- Local/demo bypass is allowed only when `AUTH_DEV_PHONE_BYPASS_ENABLED=1` and
  `NODE_ENV !== "production"`.
- Admin routes remain blocked behind the existing MFA requirement until a
  Supabase-compatible admin MFA policy is implemented.

### Consequences

- Supabase now carries both managed Postgres and identity/SMS auth.
- Clerk env vars, webhook handlers, and prebuilt auth UI are removed.
- Phone is PII and must not be exposed in public DTOs, analytics props, Sentry
  events, Open Graph metadata, or card verification responses.

---

## ADR-005 — Billing

### Context

Two paid tiers: VIP (annual subscription) and BUSINESS (annual + listing
fees). Plus refund flow, dunning, invoice downloads, and the option of
Payment Links for one-off promo cohorts.

### Decision

**Stripe `^17`**, pinned `apiVersion: "2024-12-18.acacia"` in
`/src/lib/stripe/config.ts`. Subscriptions + Customer Portal + Payment
Links + webhooks.

Critical implementation invariants (also enforced by Patch-02 and Patch-03):

1. `current_period_end` and `current_period_start` are read **from**
   `subscription.items.data[0]`, not from the Subscription root. The root
   fields are removed in 2024-12-\* API.
2. Webhook idempotency uses atomic claim:
   ```sql
   INSERT INTO stripe_events (event_id, ...) VALUES (...)
   ON CONFLICT (event_id) DO NOTHING
   RETURNING id
   ```
   If `RETURNING` is empty, exit early with `200 { duplicate: true }`. Do
   NOT process the event a second time.
3. Stripe `metadata` carries only `kclub_user_id` and
   `kclub_membership_type`. No PII (no email, no name).
4. Customer Portal is the default account-management surface. We do not
   reimplement subscription management UI.
5. `apiVersion` bumps require a new ADR (or at minimum a documented
   migration in `/docs/BILLING-FLOWS.md`).

### Alternatives considered

- **Paddle.** Better for global VAT/MoSS, weaker subscription primitives
  and less mature webhook tooling. Rejected for MVP; revisit at international
  scale.
- **LemonSqueezy.** Similar to Paddle. Same call.
- **Roll our own with Stripe Checkout one-off + manual recurrence.**
  Trades vendor surface for our own bug surface. Rejected.

### Consequences

- Best-in-class subscription primitives (proration, trials, coupons).
- Customer Portal removes ~2 weeks of UI work.
  − We must keep up with API version changes — at least one breaking change
  per year is normal. Documented as a quarterly task in RUNBOOK.
  − Stripe is US-domiciled — fine for our entity (see `LEGAL-PARAMS.md`),
  may matter for EU customer perception. Not a blocker for MVP.

---

## ADR-006 — Localization

> Status: SUPERSEDED by ADR-013, 2026-05-26.

### Context

The original brief asked for RU / EN / UK. The product spec is currently in
RU. The prompts default to `en` only. Three locales at MVP means roughly
3× the copy effort and 3× the QA on every UI change, plus translation
review cycles we don't have a process for yet.

KCLUB's first paying audience is small and concentrated. Time-to-launch
matters more than locale coverage.

### Decision

**MVP launch: `en` only.** `ru` and `uk` are **Phase-2**, added after the
first paying cohort confirms the product fits.

Concrete rules:

- `next-intl@^3`. Config in `/src/i18n/config.ts`. `locales: ['en']` at MVP.
- URL strategy is `/[locale]/...` from day 1, even with one locale. This
  is non-negotiable: switching from no-prefix to prefixed URLs later is a
  full SEO migration. Pay the small upfront cost now.
- Default locale `en`; root `/` redirects to `/en/` server-side.
- All UI strings go through `useTranslations()` / `getTranslations()`. No
  hard-coded English in components. CI greps for naked English strings
  in JSX (best-effort heuristic).
- Message files: `/messages/en/<namespace>.json`. Namespaces follow
  `NAMING-CONVENTIONS.md §9` (`auth`, `billing`, `cards`, `directory`,
  `admin`, `legal`, `common`).
- `docs/SPEC.md` stays RU (it's the product/legal document). A parallel
  `docs/SPEC.en.md` is the version agents read. Kept in sync by hand;
  a CI diff check warns when one diverges from the other.

When Phase-2 starts (`ru`, `uk` enabled):

- Add `ru` and `uk` to `locales`. Keep `en` default.
- Translation memory: glossary in `/docs/GLOSSARY.md` is the authoritative
  source for domain terms. Forbidden vocabulary (`AGENTS.md §4`) applies
  to translations too — `partnership` is fine, `партнёрская программа` in
  the affiliate sense is not.
- CI gate: `pnpm i18n:diff` — every key present in `en` must also exist
  in `ru` and `uk` (or the build fails). No silent missing-key fallback
  to `en` in production.

### Alternatives considered

- **Three locales at MVP.** Tripled translation review for marketing copy,
  legal pages (which must be reviewed by counsel per jurisdiction),
  error messages, email templates. Pushes launch by an estimated 3–4 weeks.
- **No locale prefix at MVP, refactor later.** Painful SEO migration.
  Rejected.
- **Auto-translate `ru`/`uk` via DeepL/GPT for launch.** Risk of subtly
  wrong legal phrasing in the legal-sensitive surface (T&C, refund,
  card-verification copy). Rejected — translations stay human-reviewed.

### Consequences

- One locale to QA, write, and translate at MVP.
- URL structure already future-proof.
  − Russian and Ukrainian audiences won't see native copy at launch. For an
  English-speaking business-club positioning this is acceptable; for a
  primarily RU/UA audience this is a marketing risk to flag to stakeholders.
  − `docs/SPEC.md` (RU) vs `docs/SPEC.en.md` drift is a maintenance tax.
  Mitigated by CI diff warning.

---

## ADR-007 — Membership lifecycle

### Context

A `User` can hold memberships of different types over time: FREE today,
VIP next month, BUSINESS later, lapse back to FREE, renew. The Phase-2 DDL
draft has a `memberships` table with a unique index on
`(user_id, type, status)` — which technically lets a user have two rows
for `(VIP, ACTIVE)` and `(VIP, EXPIRED)` simultaneously, and offers no
clear answer for renewals: do we UPDATE the existing row, or INSERT a new
one and mark the old one stale?

This is the most common source of billing bugs in subscription products,
so it gets its own ADR.

### Decision

**One active row per `(user_id, type)`.** History lives in `audit_logs`,
not in `memberships`.

Concrete shape:

- Drop the `status` part of the unique index. New constraint:
  `UNIQUE (user_id, type)`. There is at most one row per user per
  membership type, ever.
- The row's `status` column reflects the **current** state:
  `ACTIVE | PAST_DUE | CANCELED | EXPIRED`.
- Stripe webhook handler uses `INSERT ... ON CONFLICT (user_id, type)
DO UPDATE SET ...`. Every transition writes an `audit_log` entry with
  action `MEMBERSHIP_<NEW_STATUS>` and a `payload` JSON containing the
  diff (`from_status`, `to_status`, `period_start`, `period_end`,
  `stripe_event_id`).
- Reporting queries that need "all VIP renewals in 2026" read from
  `audit_logs`, not from `memberships`. This is intentional: the
  operational table stays small and indexable; the historical table is
  append-only.

State machine (allowed transitions):

```
                +---------+
   (Stripe ok)  | ACTIVE  |  (Stripe failed N tries)
   ------------>|         |---------------------------->+
                +---------+                              |
                  ^                                      v
                  |                                +-----------+
                  | (manual recovery /             | PAST_DUE  |
                  |  user updates card)            |           |
                  +--------------------------------+-----------+
                                                        |
                                                        v
                                                  +-----------+
                                                  | CANCELED  |
                                                  +-----------+
                                                        |
                                       (period_end past)v
                                                  +-----------+
                                                  | EXPIRED   |
                                                  +-----------+
```

Transitions not on this diagram are rejected by the handler with an audit
entry `MEMBERSHIP_TRANSITION_REJECTED`.

### Alternatives considered

- **History inside `memberships` (one row per period).** Operational
  queries (`is this user VIP right now?`) become a `WHERE status='ACTIVE'
AND now() BETWEEN period_start AND period_end ORDER BY period_end
DESC LIMIT 1` — easy to get wrong, especially in dashboards. Rejected.
- **Separate `membership_history` table.** Double-writes on every
  transition; `audit_logs` already exists and already carries `payload`.
  Reuse beats duplication.
- **Eventually-consistent rebuild from Stripe.** Tempting but slow at
  query time. Rejected; Stripe is the source for _billing_ state, our
  `memberships` row is the source for _access_ state, and we sync the
  former into the latter on webhook.

### Consequences

- `memberships` stays small (one row per user per type, ~ N×2 rows total).
- "Is X currently VIP?" is a single PK lookup.
- Renewals don't lose history — `audit_logs` carries it.
  − Reports that span periods must JOIN `audit_logs`. Documented query
  patterns live in `/docs/BILLING-FLOWS.md`.
  − Reactivation (user resubscribes after cancellation) reuses the same
  row. We accept that the `created_at` of the membership row is "first
  ever subscription", not "current period start". Period start lives on
  the row as `current_period_start`.

---

## ADR-008 — Bot defense and rate limiting

### Context

Public surfaces in scope: marketing pages, business directory,
`/verify-card/[number]`, sign-in / sign-up. Two distinct threats:

1. **Bot-driven abuse on sign-up** (fake accounts, credential stuffing).
2. **Enumeration of card numbers** through `/verify-card/[number]`. Even
   though we constant-shape the response (see Patch-08), rate limiting
   is the primary defense.

### Decision

**Cloudflare Turnstile** (CAPTCHA) + **Upstash Redis ratelimit**.

Turnstile placement:

- Required on the sign-up form, password-reset form, and the
  card-lookup form.
- Required on phone auth initiation if SMS abuse appears in logs; Supabase
  Auth still verifies ownership through SMS OTP.
- Server-side verification via `siteverify` in a thin wrapper
  `/src/lib/captcha/turnstile.ts`. Wrapper returns
  `Result<{ ok: true }, TurnstileError>`. Tests use a deterministic mock.

Upstash limits (initial values, tunable per RUNBOOK):

| Surface                          | Window        | Limit                                |
| -------------------------------- | ------------- | ------------------------------------ |
| `/verify-card/[number]` (IP)     | sliding 60s   | 10                                   |
| `/verify-card/[number]` (number) | fixed 600s    | 5                                    |
| Sign-up                          | sliding 3600s | 5 per IP                             |
| Sign-in / phone OTP              | sliding 3600s | 5 per IP                             |
| Stripe webhook                   | none          | (signature-verified, not user input) |
| Server actions (any)             | sliding 60s   | 30 per user                          |

All rate-limit keys live under `rl:<scope>:` prefix in Redis.
`Ratelimit.slidingWindow` for human-facing limits, `fixedWindow` for
enumeration defenses (cheaper).

### Alternatives considered

- **hCaptcha.** Comparable; Turnstile chosen because it's free, faster,
  and we may end up putting Cloudflare in front of the site anyway.
- **reCAPTCHA v3.** Privacy concerns (Google-owned), and "invisible scoring"
  is harder to tune than Turnstile's challenge-or-pass model.
- **Per-IP rate limiting via Vercel Edge Middleware only.** No persistence
  across regions; sliding windows are awkward. Upstash gives us a global
  Redis with sub-100ms p99 for our region. Worth the dependency.

### Consequences

- Two clearly-scoped tools: bot defense (Turnstile) vs request rate
  (Upstash). Easy to reason about.
- Both have generous free tiers — no infra cost at MVP scale.
  − CSP must allow `challenges.cloudflare.com`. Documented in
  `docs/SECURITY.md`.
  − Upstash adds a network hop per protected request. Acceptable; the
  alternative (in-memory per-instance limiting) is broken in serverless.

---

## ADR-009 — Observability

### Context

We need errors, performance, and basic product analytics. We also need to
ship fast and not babysit observability dashboards. Privacy matters
because we're a "private club" — leaking member emails into a third-party
analytics blob would be a brand-fatal incident.

### Decision

**Sentry for errors + Plausible for analytics.** No Google Analytics.

Sentry:

- `@sentry/nextjs` with the Next 15 / React 19 SDK.
- `tracesSampleRate: 0.1` in production; `1.0` in preview deploys.
- `beforeSend` scrubber strips:
  - any header key matching `cookie|authorization|stripe-signature`,
  - any `event.user.email`, `event.user.ip_address` (we set
    `sendDefaultPii: false`),
  - any string in the request body matching the email regex (best-effort).
- `denyUrls`: Supabase Auth endpoints, Stripe's Checkout iframe — their
  errors are not ours.
- Source maps uploaded only from CI (never from dev).

Plausible:

- Self-hosted? **No.** Use plausible.io managed at MVP. Revisit if cost
  or data residency drives it.
- Script via `<Script strategy="afterInteractive">`.
- Custom events: `signup_started`, `signup_completed`,
  `checkout_started`, `checkout_completed`, `card_verified`,
  `business_published`. **No PII** in custom props — only enum-like
  membership type, country code, and source page.

### Alternatives considered

- **PostHog.** Excellent product but a lot of surface area we won't use
  at MVP. Revisit when we need session replay or feature flags at scale.
- **Datadog / New Relic / Mixpanel.** Either overkill or PII-leaky by
  default. Rejected.
- **Google Analytics 4.** Cheap, but tracker-heavy and a poor fit for
  a "private club" brand. Rejected on principle, also helps with EU
  cookie-consent surface area.

### Consequences

- Two vendors, both privacy-respectful, both with a free tier sufficient
  for MVP traffic.
- Sentry catches the long tail of runtime errors that tests don't.
  − Sentry CSP entries needed (`sentry.io` ingest hostnames). Documented.
  − Plausible is cookieless — we lose cross-device user identification.
  Acceptable; we have authenticated user IDs in our DB anyway.

---

## ADR-010 — Deployment

### Context

We need a hosting target that (a) supports Next.js 15 RSC end-to-end, (b)
gives us preview deployments per PR, (c) has cheap-to-zero cost at MVP
traffic, and (d) doesn't require ops staff.

### Decision

**Vercel for the app** (production + preview deployments) + **Supabase
managed Postgres** (per ADR-003).

Specifics:

- Project on Vercel, `main` → production, every PR → preview URL.
- Environments: `production`, `preview`, `development`. Env vars set in
  Vercel UI; mirrored to `.env.example` (without values) and
  `/docs/ENV.md` (with owner + source notes).
- Cron jobs run as Vercel Cron (the only background work at MVP is
  Stripe state reconciliation, daily at 03:00 UTC).
- Region: `iad1` (US East) for now. Co-located with Supabase if Supabase
  region matches; otherwise document the latency in RUNBOOK and revisit
  when traffic justifies multi-region.
- No edge runtime for routes that hit Postgres. Node runtime only.
  Edge is reserved for the locale-negotiation middleware and Turnstile
  pre-check (no DB).

### Alternatives considered

- **Self-host on Fly.io / Railway / Render.** More control, more ops.
  Rejected for MVP.
- **Cloudflare Pages + Workers.** Excellent for static + edge logic,
  awkward for long-running Node things (Stripe webhook handler is
  borderline). Revisit if edge becomes a hard requirement.
- **AWS Amplify / ECS.** Overkill. Rejected.

### Consequences

- Zero ops effort; preview URLs per PR are a code-review superpower.
- Tight Next.js integration — no custom build config to maintain.
  − Vendor lock-in on hosting. Mitigation: nothing in the codebase
  depends on Vercel APIs; switching to a Node host is a Dockerfile +
  domain-cutover away. We do depend on `vercel.json` for cron
  configuration; that's the only non-portable bit.
  − Cold starts on rarely-hit routes. Acceptable at MVP traffic.

---

## ADR-012 — UI component layer

### Context

ADR-001 locks the app to Tailwind v4 CSS-first config and local shadcn/ui
components copied into `/src/components/ui`. Before the remaining MVP pages
are built out, we want faster access to standard component class names without
resetting the KCLUB visual language or replacing tested Radix primitives.

### Decision

Use `daisyui@5.0.50` as a Tailwind plugin and adapter layer only.

- Configure daisyUI from `/src/app/globals.css` using Tailwind v4 `@plugin`
  syntax.
- Disable bundled daisyUI themes and define one default `kclub` theme that
  matches the dark black/gold token system from SPEC.
- Keep `/src/components/ui/*` as the public component contract. Components may
  internally use daisyUI classes such as `btn`, `card`, `badge`, `input`, and
  `textarea`.
- Keep Radix-backed components for interactive behavior where they are already
  in use, including dialogs, menus, selects, and checkbox controls.

### Consequences

- Future UI work can use a smaller set of standard component classes while
  preserving local patchability and TypeScript props.
- The public KCLUB site remains dark-only and premium instead of inheriting a
  generic daisyUI default theme.
- Replacing shadcn/Radix imports directly with daisyUI markup is not part of
  this ADR. That requires a separate design/accessibility review.

---

## ADR-013 — Localization: three-language MVP launch

### Context

The MVP launch scope now requires English, Russian, and Ukrainian from day one.
The app already uses locale-prefixed routes, so the main change is message
coverage, runtime locale handling, and launch QA across all three locales.

### Decision

Launch MVP with:

- `en`, `ru`, and `uk` enabled in `SUPPORTED_LOCALES`.
- `en` remains the default locale and `/` redirects to `/en`.
- Public route slugs remain the same across locales for MVP, for example
  `/en/directory`, `/ru/directory`, and `/uk/directory`.
- Message namespaces live in `/messages/<locale>/*.json` with strict key parity
  against English.
- Public, auth, and legal surfaces show the language switcher. Member and admin
  areas remain locale-aware through the URL and internal links.
- Russian and Ukrainian launch copy may start as draft copy, but legal-sensitive
  text requires human review before production release.

### Consequences

- Every new message key must be added to all three locales in the same diff.
- Release QA must smoke-test representative public, auth, member, and admin
  routes in all three locales.
- Localized slugs are intentionally out of scope for MVP and require a future
  ADR if SEO strategy changes.

---

## Cross-cutting consequences

These follow from the ADRs above and are restated here so reviewers can
see the whole shape:

1. **Two vendors carry sensitive data:** Supabase (identity + DB) and Stripe
   (payments). We never put PII into a fourth (Sentry,
   Plausible, Upstash, Cloudflare all see scrubbed data only).
2. **Postgres is the only system of record for product state.** Stripe
   is the source of truth for billing, but its state is mirrored into
   `memberships` and `subscriptions` tables on webhook so the app never
   has to call Stripe at read time.
3. **Drizzle schema is the only place table shape is defined.** ORM
   syncs to migrations; migrations sync to the DB; no hand-written DDL
   outside of the migrations folder.
4. **No data access in the client.** Server Components and Server
   Actions are the only callers of `db`. Client components receive
   typed DTOs.
5. **One framework end-to-end.** Next.js carries marketing, member area,
   business area, admin, and API. No separate SPA, no separate API
   service.
6. **Locales launch together.** We launch with `en`, `ru`, and `uk`, with one
   shared route shape and key-parity checks across message namespaces.

---

## How to use this file

- **Authors of new prompts** (`prompts/META/...`): every prompt's
  `Inputs` section must reference the relevant ADRs (e.g.
  `assumes ADR-003 (Drizzle), ADR-011 (Supabase Auth)`).
- **Reviewers**: reject any PR that contradicts an ADR without first
  superseding it.
- **AI agents** (Opencode/Cursor/Claude/Codex): when a prompt and this
  file disagree, **this file wins**. Stop, flag the contradiction in the
  PR description, and ask which to update.
- **Anyone adding a new vendor / tool**: open a PR with a new ADR-NNN
  appended to the Index table. Do not just `pnpm add` and document
  later.
