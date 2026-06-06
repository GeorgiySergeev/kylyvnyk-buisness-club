# ENV — Environment variables

This file is the **owner manual** for every variable in `.env.example`.
For every variable: where to obtain the value, who is responsible for
rotating it, what breaks if it's missing or wrong, and the security class.

> Rule: a new env var MUST be added in the same PR to BOTH `.env.example`
> AND this file (`/AGENTS.md §8`). PRs that touch one without the other
> are rejected by CI.

---

## Security classes

| Class    | Meaning                                              | Examples                             |
| -------- | ---------------------------------------------------- | ------------------------------------ |
| `public` | Safe to ship to browser; prefixed `NEXT_PUBLIC_`     | publishable keys, app URL, DSN       |
| `server` | Server-only secret; never embedded in client bundles | secret keys, webhook signing secrets |
| `ci`     | Used by CI only; never present at runtime            | source map upload tokens             |
| `flag`   | Non-secret behavior switch                           | `ALLOW_SEED`, `NODE_ENV`             |

CI greps for any non-`NEXT_PUBLIC_` env var read from a client component
and fails the build. See `prompts/META/PATCHES/Patch-04` style for the
underlying rationale.

---

## Environments

| Environment   | Source of values                        | Notes                                     |
| ------------- | --------------------------------------- | ----------------------------------------- |
| `development` | `.env.local` on developer machine       | Never committed                           |
| `preview`     | Vercel project env vars (Preview scope) | Per-PR URLs; uses Stripe test mode        |
| `production`  | Vercel project env vars (Production)    | Stripe live mode; Sentry live project     |
| `test` / CI   | GitHub Actions secrets + ephemeral DB   | Stripe in test mode; mocked Supabase Auth |

A variable is "missing" if it's empty in the active environment. The app's
typed env loader (`src/lib/env.ts`) calls `zod.parse` on startup and
**fails fast** with the list of missing keys. Never read `process.env.X!`
directly outside of `src/lib/env.ts` (`NAMING-CONVENTIONS.md §11`).

---

## Variable reference

Format for each entry:

> **VAR_NAME**
> Class · Required · Default · Source · Owner · Rotates · Breaks if missing

---

### App

#### `NEXT_PUBLIC_APP_URL`

public · required · `http://localhost:3000` in dev · set by hand or Vercel
auto · owner: tech lead · rotates: on domain change · breaks: absolute URLs
in emails, OG tags, Stripe redirect URLs, and auth redirects.

#### `NODE_ENV`

flag · required · platform-set · owner: platform · rotates: never · breaks:
optimizations, log verbosity, `ALLOW_SEED` gating.

---

### Database (ADR-003)

#### `DATABASE_URL`

server · required · — · Supabase Dashboard → Project → Settings →
Database → Connection Pooler (**Transaction** mode, port **6543**) · owner:
DB owner · rotates: on Supabase password reset · breaks: every read/write
in the app.

Format MUST include `?pgbouncer=true&connection_limit=1`. The driver
(`postgres-js`) is configured with `prepare: false` against this URL. If
you copy a non-pooled URL here, you'll get
`prepared statement "s1" already exists` under load.

#### `DATABASE_URL_DIRECT`

server · required · — · Supabase Dashboard → same page → **Session** mode,
port **5432** · owner: DB owner · rotates: same as above · breaks:
`pnpm db:migrate`, `pnpm db:generate`, `drizzle-kit studio`.

Used ONLY by `drizzle-kit`. The app never reads this at runtime.

#### `TEST_DATABASE_URL`

ci Â· optional Â· empty by default Â· disposable Postgres database only Â· owner:
test owner Â· rotates: with test DB lifecycle Â· breaks: `pnpm test:db`.

This URL is never used by the app. It is an opt-in pre-release/CI test target
for applying committed SQL migrations in order. The database name must contain
`test`, `ci`, or `scratch`; the test refuses any other database name. Do not
point it at development, staging, preview, or production.

---

### Authentication — Supabase Auth (ADR-011)

#### `NEXT_PUBLIC_SUPABASE_URL`

public · required · — · Supabase Dashboard → Project Settings → API ·
owner: auth owner · rotates: on Supabase project migration · breaks:
phone auth UI and session refresh.

#### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

public · required · — · Supabase Dashboard → Project Settings → API ·
owner: auth owner · rotates: with Supabase key rotation · breaks:
SMS OTP request, verification, and auth cookie refresh.

#### `AUTH_DEV_PHONE_BYPASS_ENABLED`

server · optional flag · empty by default · local `.env.local` only · owner:
tech lead · rotates: never · breaks: local/demo phone auth bypass. Production
code rejects this bypass when `NODE_ENV=production`.

#### `AUTH_DEV_2FA_BYPASS_ENABLED`

server · optional flag · empty by default · owner: tech lead · rotates: never ·
breaks: local/admin 2FA testing. When set to `1` outside production,
`hasVerifiedMfaInSession()` returns `true`, allowing admin access without a
verified Supabase `aal2` session. Production code ignores this bypass.

#### Member avatars (Supabase Storage)

No additional variables. Requires a one-time Supabase bucket **`avatars`**
with RLS policies documented in [`docs/AVATAR-STORAGE.md`](./AVATAR-STORAGE.md).
If the bucket is missing, profile photo upload on `/m/dashboard` fails with a
server error while other profile fields may still save.

---

### Billing — Stripe (ADR-005)

#### `STRIPE_SECRET_KEY`

server · required · — · Stripe Dashboard → Developers → API keys ·
owner: billing owner · rotates: on suspected leak; quarterly review ·
breaks: all server-side Stripe calls (Checkout, Portal, subscription
reads).

Use `sk_test_*` everywhere except production. Vercel preview deploys MUST
use test keys — never paste a live key into preview env.

#### `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

public · required · — · same page · owner: billing owner · rotates: with
secret key · breaks: client-side Stripe.js (Checkout redirect).

#### `STRIPE_WEBHOOK_SECRET`

server · required · — · in dev: `stripe listen --print-secret`; in prod:
Dashboard → Webhooks → endpoint → Signing secret · owner: billing owner ·
rotates: on endpoint URL change · breaks: `/api/stripe/webhook` signature
verification — Stripe will mark events as failed and start retrying.

**In dev:** the secret printed by `stripe listen` is ephemeral; re-run
`stripe listen` after a reboot and update `.env.local`. This is normal.

#### `STRIPE_PRICE_VIP_ANNUAL`

server · required · — · Stripe Dashboard → Products → your product →
Pricing → price ID · owner: billing owner · rotates: when product
restructured · breaks: checkout sessions return "No such price".

#### `STRIPE_PRICE_BUSINESS_ANNUAL`

server · required · — · Stripe Dashboard → Products → your product →
Pricing → price ID · owner: billing owner · rotates: when product
restructured · breaks: checkout sessions return "No such price".

Whenever you create a new price (e.g. for a promo) DO NOT replace the
existing constants — add a new env var (`STRIPE_PRICE_VIP_ANNUAL_PROMO_2026`)
and let the code branch on it. Existing subscribers must keep their
original price.

#### `STRIPE_PORTAL_CONFIGURATION_ID`

server · required · — · Stripe Dashboard → Settings → Billing → Customer
Portal → your configuration · owner: billing owner · rotates: when portal
copy/flow changes · breaks: Customer Portal session creation fails.

#### `CRON_SECRET`

server · optional · — · Vercel Dashboard → Project → Settings → Environment
Variables · owner: platform owner · rotates: on suspected leak · breaks:
daily Stripe reconciliation cron (`/api/cron/stripe-reconcile`) rejects all
requests with 401 when set; when unset the endpoint runs without auth
(acceptable only in development/preview).

Set to a random string (e.g. `openssl rand -hex 32`). Vercel injects it
as `Bearer <CRON_SECRET>` in the `Authorization` header on every cron
invocation.

---

### Rate limiting — Upstash (ADR-008)

#### `UPSTASH_REDIS_REST_URL`

server · required · — · Upstash Console → your DB → REST API → URL ·
owner: platform owner · rotates: on DB migration · breaks: every rate
limit check (`/verify-card`, sign-up, server actions).

#### `UPSTASH_REDIS_REST_TOKEN`

server · required · — · Upstash Console → same page → REST API → Token ·
owner: platform owner · rotates: on suspected leak · breaks: same as
above.

If Upstash is unreachable, the rate-limit wrapper **fails closed** — it
returns "limit exceeded" rather than letting requests through. Documented
in `/docs/SECURITY.md`. Do not change this behavior without an ADR.

---

### Bot defense — Turnstile (ADR-008)

#### `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

public · required · — · Cloudflare Dashboard → Turnstile → your site ·
owner: platform owner · rotates: on site migration · breaks: Turnstile
widget fails to render on forms; submissions blocked because
`siteverify` rejects missing tokens.

Dev tip: Cloudflare ships always-pass and always-fail test keys
(`1x00000000000000000000AA` etc.). Use them in unit/integration tests.

#### `TURNSTILE_SECRET_KEY`

server · required · — · same page · owner: platform owner · rotates: with
site key · breaks: `siteverify` returns 401, server actions reject all
form submissions.

---

### Observability — Sentry (ADR-009)

Runtime wiring lives in `sentry.client.config.ts`, `sentry.server.config.ts`,
`sentry.edge.config.ts`, and `src/instrumentation.ts`. Error boundaries
(`src/app/global-error.tsx`, `src/app/[locale]/error.tsx`) call
`Sentry.captureException` on the client.

Sentry is **enabled** only when:

- `NEXT_PUBLIC_SENTRY_DSN` is set and is not a placeholder (`REPLACE_ME`, `example@`), and
- `NODE_ENV=production` **or** `VERCEL_ENV=preview`.

Local development and CI placeholder DSNs skip remote capture; errors still
render through the error boundary UI.

#### `NEXT_PUBLIC_SENTRY_DSN`

public · required · — · Sentry → Project → Settings → Client Keys (DSN) ·
owner: observability owner · rotates: rarely · breaks: errors not
captured (silent failure — alert via a synthetic test in CI).

#### `SENTRY_ORG`

ci · required at build · `kclub` · — · owner: observability owner · rotates:
never · breaks: source map upload step in CI; runtime unaffected.

#### `SENTRY_PROJECT`

ci · required at build · `kclub-web` · — · owner: observability owner ·
rotates: never · breaks: source map upload step in CI; runtime unaffected.

#### `SENTRY_AUTH_TOKEN`

ci · required in CI · — · Sentry → Settings → Account → API → Auth Tokens
(scope `project:releases`) · owner: observability owner · rotates:
quarterly · breaks: source maps not uploaded; stack traces in Sentry are
minified and unreadable. **Never** put in `.env.local`.

---

### Analytics — Plausible (ADR-009)

#### `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

public · required · — · the domain you registered in Plausible · owner:
marketing/observability owner · rotates: on domain change · breaks: no
pageviews recorded; custom events still fire but are unattributed.

---

### Email (optional at MVP)

#### `RESEND_API_KEY` (optional)

server · optional · — · Resend Dashboard → API Keys · owner: tech lead ·
rotates: on suspected leak · breaks: transactional emails (none at MVP;
Supabase handles auth SMS itself).

Enable only when we add our own emails (welcome, payment receipt
override, introduction notifications).

#### `EMAIL_FROM` (optional)

flag · optional · `"KCLUB <hello@kclub.example.com>"` · — · owner: tech
lead · rotates: on domain or brand change · breaks: emails sent from
default Resend domain (unbranded).

---

### Internal flags

#### `ALLOW_SEED`

flag - optional - `""` (off) - owner: tech lead - breaks: `pnpm
db:seed` refuses to run unless `ALLOW_SEED === "1"`, `CONFIRM_SEED ===
"I_CONFIRM"`, and `DATABASE_URL` points to `localhost`, `127.0.0.1`, or `::1`.
Remote database URLs are refused even when the flags are set.

#### `CONFIRM_SEED`

string - optional - `""` (off) - owner: tech lead - breaks: `pnpm
db:seed` refuses to run unless the value is exactly `I_CONFIRM`. This is a
second explicit confirmation for destructive local seed operations.

#### `DISABLE_VOCAB_GREP`

flag · optional · `""` (off) · — · owner: contributor temporarily editing
`docs/GUARDRAILS.md` · breaks: local pre-commit hook lets forbidden words
through. CI **ignores** this flag and always greps.

---

## Onboarding checklist

For a new developer setting up the project locally:

```
[ ] Clone the repo, `pnpm install`
[ ] Copy .env.example to .env.local
[ ] Get DATABASE_URL + DATABASE_URL_DIRECT from DB owner (Supabase project: kclub-dev)
[ ] Get Supabase Auth project URL + publishable key from auth owner
[ ] Create personal Stripe account in test mode; ask billing owner for product IDs
[ ] `stripe listen --forward-to localhost:3000/api/stripe/webhook` → paste STRIPE_WEBHOOK_SECRET
[ ] Create personal Upstash Redis DB OR get shared dev token from platform owner
[ ] Use Turnstile test keys (1x00000000000000000000AA / 1x0000000000000000000000000000000AA)
[ ] Sentry: leave NEXT_PUBLIC_SENTRY_DSN empty in dev; capture goes to stdout instead
[ ] Plausible: leave NEXT_PUBLIC_PLAUSIBLE_DOMAIN empty in dev
[ ] `pnpm db:migrate` → expect 0 errors
[ ] `pnpm dev` → http://localhost:3000 → redirect to /en/
```

If any step blocks for more than 30 minutes, ping the owner listed above
rather than guessing.

---

## Rotation playbook (production)

> One-page summary; full procedure in `/docs/RUNBOOK.md`.

| Secret                                 | Rotation window         | Method                                     | Downtime                         |
| -------------------------------------- | ----------------------- | ------------------------------------------ | -------------------------------- |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | on project key rotation | Supabase → API keys → update Vercel        | auth unavailable during mismatch |
| `STRIPE_SECRET_KEY`                    | on leak only            | Stripe → roll key → update Vercel          | none                             |
| `STRIPE_WEBHOOK_SECRET`                | on leak / endpoint move | Stripe → roll secret on endpoint           | none                             |
| `DATABASE_URL` (password)              | on leak                 | Supabase → reset password → update Vercel  | ~30s                             |
| `UPSTASH_REDIS_REST_TOKEN`             | on leak                 | Upstash → rotate token → update Vercel     | none (fails closed during gap)   |
| `TURNSTILE_SECRET_KEY`                 | on site migration       | Cloudflare → site → rotate                 | none                             |
| `SENTRY_AUTH_TOKEN`                    | quarterly               | Sentry → new token → update GitHub Secrets | CI only                          |

Rotation rule: never rotate two secrets in the same deploy. One at a
time, verify, then the next.

---

## How CI checks this file stays honest

- `pnpm env:check` parses `.env.example` and `docs/ENV.md` and asserts:
  - Every variable in `.env.example` has a section in `docs/ENV.md`.
  - Every section in `docs/ENV.md` corresponds to a variable in
    `.env.example`.
  - Variables used in source (`grep -RInE "process\.env\.[A-Z_]+"`) are
    either listed in `.env.example` or explicitly allowlisted in
    `src/lib/env.ts`.
- A drift → CI red.
- Local pre-commit hook runs the same check on `.env.example` /
  `docs/ENV.md` changes.
