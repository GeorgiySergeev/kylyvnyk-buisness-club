# RUNBOOK — KCLUB-MVP

Operational manual: every command, every recovery procedure, every
"why doesn't this work" you'll hit in development, CI, and production.

> If you spent more than 15 minutes solving something operational that
> isn't in this file — add a section before closing the ticket. The
> runbook is the team's memory.

---

## Table of contents

1. [Local development setup](#1-local-development-setup)
2. [Daily commands cheat sheet](#2-daily-commands-cheat-sheet)
3. [Database workflow](#3-database-workflow)
4. [Stripe in development](#4-stripe-in-development)
5. [Clerk in development](#5-clerk-in-development)
6. [i18n workflow](#6-i18n-workflow)
7. [Testing](#7-testing)
8. [CI / CD pipeline](#8-ci--cd-pipeline)
9. [Deployment](#9-deployment)
10. [Production operations](#10-production-operations)
11. [Secret rotation](#11-secret-rotation)
12. [Backups and disaster recovery](#12-backups-and-disaster-recovery)
13. [Incident response](#13-incident-response)
14. [Troubleshooting catalog](#14-troubleshooting-catalog)
15. [Periodic chores](#15-periodic-chores)

---

## 1. Local development setup

One-time setup on a fresh machine. Expected time: 30–45 minutes.

### 1.1 Prerequisites

```bash
# Node — use the exact version pinned in .nvmrc
nvm install
nvm use
node --version    # must match .nvmrc (20.18.x)

# pnpm — pinned via package.json `packageManager`
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm --version    # 9.15.x

# Stripe CLI — for webhook forwarding in dev
brew install stripe/stripe-cli/stripe          # macOS
# OR: scoop install stripe                     # Windows
# OR: https://github.com/stripe/stripe-cli/releases  # binary

# Optional but recommended:
brew install jq                                # for inspecting webhook payloads
```

### 1.2 Clone and install

```bash
git clone git@github.com:GeorgiySergeev/kylyvnyk-buisness-club.git
cd kylyvnyk-buisness-club
pnpm install --frozen-lockfile
```

### 1.3 Environment

```bash
cp .env.example .env.local
# Fill values per /docs/ENV.md (onboarding checklist section)
```

Do NOT use `.env` (the unsuffixed one). Next.js reads `.env.local` and
keeps it out of git. The `.env` file in the repo is intentionally empty
and exists only because tooling sometimes auto-creates it.

### 1.4 Database

```bash
# Ask the DB owner for the dev Supabase project's connection strings,
# put them into .env.local as DATABASE_URL (pooled, port 6543)
# and DATABASE_URL_DIRECT (direct, port 5432).

pnpm db:migrate     # applies migrations using DATABASE_URL_DIRECT
pnpm db:seed        # seeds dev-only fixtures (ALLOW_SEED gating)
```

Verify:

```bash
pnpm db:studio      # opens drizzle-kit studio; you should see all tables
```

### 1.5 First run

```bash
pnpm dev
# open http://localhost:3000  → should redirect to /en/
```

If anything fails here, jump to §14 Troubleshooting.

---

## 2. Daily commands cheat sheet

```bash
# App
pnpm dev                  # Next.js dev server with HMR
pnpm build                # production build
pnpm start                # serve the built app (rare locally)

# Quality gates
pnpm lint                 # ESLint
pnpm lint:fix             # ESLint --fix
pnpm typecheck            # tsc --noEmit
pnpm format               # Prettier write
pnpm format:check         # Prettier check (used in CI)

# Tests
pnpm test                 # Vitest, watch mode if TTY
pnpm test:run             # Vitest, single run (CI mode)
pnpm test:coverage        # with coverage report
pnpm e2e                  # Playwright e2e
pnpm e2e:ui               # Playwright UI mode for debugging

# Database
pnpm db:generate          # drizzle-kit generate — create migration from schema diff
pnpm db:migrate           # apply pending migrations
pnpm db:push              # DEV ONLY — push schema without migration (avoid in shared envs)
pnpm db:studio            # local DB explorer
pnpm db:seed              # run /src/db/seed.ts
pnpm db:reset             # DROP + migrate + seed; DEV ONLY; refuses unless NODE_ENV=development

# Stripe
pnpm stripe:listen        # alias for `stripe listen --forward-to localhost:3000/api/stripe/webhook`
pnpm stripe:trigger <event>  # send a fake event, e.g. `customer.subscription.updated`

# i18n
pnpm i18n:diff            # asserts en/ru/uk key parity (no-op while only `en` is enabled)
pnpm i18n:extract         # OPTIONAL — extract t() calls into messages files (Phase-2)

# Guardrails / env contract
pnpm vocab:check          # forbidden-vocab grep, see /docs/GUARDRAILS.md
pnpm env:check            # asserts .env.example <-> docs/ENV.md parity

# Combined gate (what CI runs)
pnpm verify               # lint + typecheck + test:run + vocab:check + env:check + build
```

`pnpm verify` is the single command to run before opening a PR. If it's
green locally, CI is green 95% of the time.

---

## 3. Database workflow

### 3.1 Conceptual model

- **Schema** (TypeScript files in `/src/db/schema/*.ts`) is the source of truth.
- **Migrations** (SQL files in `/drizzle/`) are append-only history.
- **Database state** is what migrations have been applied to.

Workflow: edit schema → `db:generate` → review SQL → commit both → others
pull → `db:migrate`.

### 3.2 Adding a column

```bash
# 1. Edit the schema file:
#    /src/db/schema/business.ts
#    add: phoneNumber: text("phone_number"),

# 2. Generate migration
pnpm db:generate
# drizzle-kit creates /drizzle/0007_add_business_phone.sql

# 3. Inspect the generated SQL — never trust blindly
cat drizzle/0007_add_business_phone.sql

# 4. Apply locally
pnpm db:migrate

# 5. Commit BOTH the schema change AND the migration in the same commit
git add src/db/schema/business.ts drizzle/0007_add_business_phone.sql
git commit -m "feat(db): add businesses.phone_number"
```

### 3.3 Renaming a column

drizzle-kit cannot detect renames. It will generate a DROP + ADD, which
**loses data**. To rename safely:

```bash
# 1. Edit the schema with the new name
# 2. pnpm db:generate
# 3. Open the generated SQL and replace
#       ALTER TABLE ... DROP COLUMN old_name;
#       ALTER TABLE ... ADD COLUMN new_name ...;
#    with
#       ALTER TABLE ... RENAME COLUMN old_name TO new_name;
# 4. pnpm db:migrate
# 5. Commit
```

A reviewer MUST inspect the SQL on every rename. This is why the schema
PR and the migration PR are the same PR — separated, this check is too
easy to skip.

### 3.4 Dropping a column / table

**Two-PR rule** for any destructive change against an environment that
has data:

- **PR 1**: stop writing to the column in app code. Deploy. Wait until
  there is no reader/writer (check logs for 24h in production).
- **PR 2**: actual DROP migration.

Never combine "stop using" + "DROP" in one deploy. Rollback becomes
impossible the moment the deploy goes out.

### 3.5 Connection pooling gotcha

The pooled URL (port 6543, PgBouncer transaction mode) **must** be used
with `prepare: false` in the postgres-js driver. The direct URL (port 5432) must be used by drizzle-kit migrations.

If you see this error:

```
PostgresError: prepared statement "s1" already exists
```

Cause: someone bypassed `prepare: false` (often by adding a second
`postgres()` call elsewhere in the codebase). Fix: route all queries
through `src/db/client.ts`, never instantiate a second client.

If you see this:

```
syntax error at or near "CONCURRENTLY"
permission denied to create extension
```

…during a migration: you ran the migration against the pooled URL. Use
`DATABASE_URL_DIRECT` for drizzle-kit. The `db:migrate` script is
already wired to do that — check that you didn't override `DATABASE_URL`
in your terminal.

### 3.6 Migrations in CI / Vercel

CI does NOT run migrations. Migrations are applied manually before a
deploy that requires them:

```bash
# from your machine, against production:
DATABASE_URL_DIRECT="postgres://...prod..." pnpm db:migrate
```

Reasoning: automatic migrations on deploy + a bad migration = downtime
during rollback. Manual gate keeps the human in the loop. This will be
reconsidered when we have a staging environment to test migrations against.

---

## 4. Stripe in development

### 4.1 First-time Stripe setup

1. Create a Stripe account in test mode.
2. Stripe Dashboard → Products → create:
   - "KCLUB VIP" with annual recurring price → copy the `price_*` ID.
   - "KCLUB BUSINESS" same shape → copy the `price_*` ID.
3. Put the price IDs into `.env.local` as `STRIPE_PRICE_VIP_ANNUAL` and
   `STRIPE_PRICE_BUSINESS_ANNUAL`.
4. Stripe Dashboard → Settings → Billing → Customer Portal → create a
   default configuration → copy the `bpc_*` ID into
   `STRIPE_PORTAL_CONFIGURATION_ID`.
5. `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` from
   Developers → API keys.

### 4.2 Receiving webhooks locally

```bash
# Terminal 1:
pnpm dev

# Terminal 2:
stripe login                          # one-time
pnpm stripe:listen
# → "Ready! Your webhook signing secret is whsec_..."
# Copy that secret into .env.local as STRIPE_WEBHOOK_SECRET.
# Restart `pnpm dev` to pick up the new env.

# Terminal 3 (testing events):
pnpm stripe:trigger customer.subscription.created
pnpm stripe:trigger customer.subscription.updated
pnpm stripe:trigger invoice.payment_failed
```

The webhook secret printed by `stripe listen` is ephemeral — it changes
on every `stripe listen` invocation. Re-copy after every restart. This
is normal CLI behavior, not a bug.

### 4.3 Testing the idempotency claim

Send the same event twice:

```bash
pnpm stripe:trigger customer.subscription.updated > /tmp/event.txt
cat /tmp/event.txt | grep "Trigger succeeded"
# now repeat the same event by replaying from Dashboard → Events → resend
```

Expected: handler invoked **once**, second delivery returns
`200 { duplicate: true }`, and `stripe_events` table has exactly one row
for that `event_id`.

If the handler ran twice, Patch-03 was not applied or was reverted.
Check the `INSERT ... ON CONFLICT DO NOTHING RETURNING id` in
`/app/api/stripe/webhook/route.ts`.

### 4.4 Subscription period extraction

If you see `Invalid Date` in a membership row's `current_period_end`,
the `getSubscriptionPeriod` helper (Patch-02) wasn't used. The fix:
read `subscription.items.data[0].current_period_end`, not
`subscription.current_period_end`. The root field was removed in Stripe
API 2024-12-\*. Pinned `apiVersion` is in `/src/lib/stripe/config.ts`.

### 4.5 Test cards

Stripe maintains a list at https://stripe.com/docs/testing. The ones we
hit most:

```
4242 4242 4242 4242  any future date, any CVC  → success
4000 0025 0000 3155  → requires 3DS (use to test authentication flow)
4000 0000 0000 9995  → declined (insufficient_funds)
4000 0000 0000 0341  → succeeds but attaching to customer fails
```

### 4.6 Going to production

Before flipping live mode:

- [ ] All `STRIPE_*` env vars in Vercel production scope use **live** keys.
- [ ] Webhook endpoint in Stripe Dashboard points to
      `https://kclub.example.com/api/stripe/webhook`.
- [ ] `STRIPE_WEBHOOK_SECRET` in production matches that endpoint's
      signing secret.
- [ ] `apiVersion` in `/src/lib/stripe/config.ts` is the version your
      live keys are pinned to.
- [ ] Tested at least one full subscription lifecycle on staging:
      `created → updated → invoice.paid → invoice.payment_failed →
  customer.subscription.deleted`.

Preview deployments must NEVER have live keys. The check is mechanical:
`STRIPE_SECRET_KEY` in preview must start with `sk_test_`.

---

## 5. Clerk in development

### 5.1 First-time setup

Two paths:

**A. Personal dev instance** (recommended for solo experimentation):

1. Sign up at clerk.com, create a new application "kclub-dev-<yourname>".
2. Copy publishable + secret keys into `.env.local`.
3. Configure sign-in / sign-up URLs to match `.env.local`
   (`/en/sign-in`, `/en/sign-up`).

**B. Shared dev instance** (for team consistency):

1. Ask auth owner for the shared dev instance keys.
2. The shared instance has predefined test users (see internal wiki).

### 5.2 Clerk webhooks locally

Clerk needs a public URL to send webhooks. In dev, use a tunnel:

```bash
# install ngrok (or use cloudflared tunnel)
brew install ngrok

# expose your local app
ngrok http 3000

# copy the https URL → Clerk Dashboard → Webhooks → Endpoint:
#   https://abcd-1234.ngrok-free.app/api/clerk/webhook
# Subscribe to events: user.created, user.updated, user.deleted
# Copy the signing secret into .env.local as CLERK_WEBHOOK_SECRET
# Restart `pnpm dev`
```

If you skip webhooks in dev, users created via Clerk UI won't have a
corresponding row in our `users` table. The app will throw
`USER_NOT_PROVISIONED` on first action. Either set up the tunnel, or
use the dev-only fallback in `/src/lib/auth/current-user.ts` that
upserts on first read (gated by `NODE_ENV === "development"`).

### 5.3 The `auth()` is async trap

Patch-01 fixed this everywhere, but the trap re-surfaces in every new
file an agent generates. The rule:

```ts
// ✅ correct (Clerk v6)
const { userId } = await auth();

// ❌ broken — returns Promise, userId is undefined at runtime
const { userId } = auth();
```

If you see `Property 'userId' does not exist on type 'Promise<...>'`,
you missed an `await`.

### 5.4 Role resolution

Clerk holds identity. Our `users.role` column holds authorization. The
order of truth: webhook → mirror into `users` row → `users.role` is read
by middleware and server actions. Never read `publicMetadata.role` from
Clerk in business logic — it can drift from our DB.

### 5.5 2FA for admins

Admin promotion procedure:

1. The user must have 2FA enabled in their Clerk account (TOTP or SMS).
2. Run `pnpm script:promote-admin <clerk-user-id>` (or update via
   Drizzle Studio) — sets `users.role = 'ADMIN'`.
3. Middleware checks `twoFactorEnabled` on every admin route. A user
   with `role = ADMIN` but no 2FA gets redirected to `/m/2fa-required`.

Never grant admin to a user without 2FA. The check is also enforced in
CI by a Playwright test.

---

## 6. i18n workflow

At MVP: `en` only. The workflow still exists because URL structure is
locale-prefixed from day 1 (ADR-006).

### 6.1 Adding a string

```ts
// 1. In the component:
const t = useTranslations("billing.checkout");
return <button>{t("cta")}</button>;

// 2. Add the key to messages/en/billing.json:
{
  "checkout": {
    "cta": "Start subscription"
  }
}
```

### 6.2 No hard-coded strings rule

```bash
# CI runs this heuristic
grep -RInE ">([A-Z][a-z]+ ){2,}[A-Z][a-z]+<" app/ src/components/ src/features/
# matches things like `>Welcome Back Friend<` — uncovered text in JSX
```

False positives exist (technical labels like `<code>POST API</code>`),
which is why it's a soft lint, not a hard fail. Reviewers eyeball the
output.

### 6.3 Phase-2 (when `ru` / `uk` lands)

1. Add locales to `/src/i18n/config.ts`: `locales: ['en', 'ru', 'uk']`.
2. Duplicate `messages/en/*.json` into `messages/ru/` and `messages/uk/`.
3. Translate. Glossary in `/docs/GLOSSARY.md` is binding.
4. Enable `pnpm i18n:diff` as a hard CI gate.
5. Add a language switcher component to the global header.
6. Re-test all Playwright flows with each locale.

---

## 7. Testing

### 7.1 Pyramid

| Layer       | Tool                 | What it covers                                     |
| ----------- | -------------------- | -------------------------------------------------- |
| Unit        | Vitest               | pure helpers, Zod schemas, formatters, period math |
| Integration | Vitest + test DB     | server actions, drizzle queries, webhook handlers  |
| e2e         | Playwright           | sign-in, checkout, verify-card, admin flows        |
| a11y        | Playwright + axe     | every public page, key auth pages                  |
| Visual      | Playwright snapshots | design-system components                           |

### 7.2 Test database

Integration tests run against a real ephemeral Postgres:

```bash
# pnpm test:run boots a Postgres in a Docker container and runs migrations
# before the suite. If Docker isn't running, the integration tests skip.

docker info > /dev/null && pnpm test:run
```

In CI, the GitHub Actions runner uses a `services: postgres` declaration —
no Docker manipulation needed.

### 7.3 Stripe webhook tests

Two modes:

- **Unit** — stub `stripe.webhooks.constructEvent` and feed a synthetic
  event JSON. Fast, runs in Vitest.
- **e2e** — `stripe trigger` against a real test endpoint, asserts DB
  state. Slow, runs nightly, not on every PR.

### 7.4 Playwright PII assertion

Every public route that returns data has a test that asserts the response
key set **exactly**:

```ts
// e2e/verify-card.e2e.ts
test('verify-card returns only the allowed PII keys', async ({ request }) => {
  const res = await request.get('/api/cards/lookup/VIP-UA-XXXXX');
  const body = await res.json();
  expect(Object.keys(body).sort()).toEqual(
    ['expiresAt', 'memberName', 'memberType', 'number', 'status'].sort(),
  );
});
```

If a future migration adds a column to a join and the developer forgets
to update the DTO, this test fails. That's the point.

### 7.5 Running a single test

```bash
pnpm test src/lib/stripe/period.spec.ts        # one file
pnpm test -t "rejects 11th request"            # by test name
pnpm e2e e2e/verify-card.e2e.ts --headed       # Playwright headed
```

---

## 8. CI / CD pipeline

### 8.1 What runs on every PR

Defined in `.github/workflows/ci.yml`:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test:run`
5. `pnpm vocab:check` (forbidden-vocab grep)
6. `pnpm env:check` (.env.example ↔ docs/ENV.md parity)
7. `pnpm build`
8. Lighthouse CI on the preview URL (non-blocking warning on regressions
   ≥ 5 points from baseline)
9. Playwright e2e against the preview URL (blocking on failures)

A failed step blocks merge. There is no `--no-verify` for the CI.

### 8.2 What runs on `main`

Same as above, plus:

1. Sentry release creation + source map upload.
2. Vercel production deployment is triggered automatically on green.

Migrations are **not** part of this — see §3.6.

### 8.3 Skipping CI

Don't. If a CI step is wrong, fix the step.

If a docs-only change genuinely doesn't need a full build, prefix the
commit subject with `docs:` — the workflow conditional skips `build` and
`e2e` for `docs:` commits. Lint/typecheck still run.

---

## 9. Deployment

### 9.1 Environments

| Environment | Branch / trigger | URL                            | Stripe mode |
| ----------- | ---------------- | ------------------------------ | ----------- |
| development | local            | http://localhost:3000          | test        |
| preview     | every PR         | https://kclub-pr-NN.vercel.app | test        |
| production  | merge to `main`  | https://kclub.example.com      | live        |

No "staging" environment at MVP. The preview URL of the PR being merged
serves the same purpose. Staging will be added when we have manual QA
gates.

### 9.2 Deploying production

```
1. Open PR. Wait for green CI + preview URL.
2. Review on the preview URL — click through the changed flows.
3. If the PR adds a migration:
   3a. From your machine:
       DATABASE_URL_DIRECT="<prod direct url>" pnpm db:migrate
   3b. Verify in Supabase Studio that the migration is applied.
4. Merge PR to main.
5. Vercel deploys automatically. Watch the deployment status.
6. Smoke test production: sign in, hit /verify-card, open Stripe Portal.
```

### 9.3 Rolling back

Two flavors:

**App code rollback** (no schema change):

```bash
# In Vercel Dashboard → Deployments → previous deployment → "Promote to Production"
# Time to recover: ~30 seconds
```

**Schema rollback** (migration applied):

There is no automatic down-migration. drizzle-kit doesn't generate
reversible migrations by default, and reversibility for arbitrary DDL is
hard. The procedure:

1. Identify the broken migration (`drizzle/0007_*.sql`).
2. Write a **forward** migration that undoes it (`0008_revert_0007.sql`)
   manually. Be precise — wrong manual SQL is worse than a bad rollback.
3. Promote the previous app deployment.
4. Apply the revert migration:
   `DATABASE_URL_DIRECT=... pnpm db:migrate`.
5. Post-mortem.

This is why §3.4 two-PR rule for destructive changes exists. Skipping it
makes rollback exponentially more painful.

---

## 10. Production operations

### 10.1 Daily look-around (5 minutes)

- Sentry → check Issues tab for new errors in last 24h. Triage each.
- Vercel → check deployment status, any failed builds since yesterday.
- Stripe → Dashboard → Events → check for failed webhook deliveries (4xx/5xx).
- Plausible → top-line traffic & funnel.

If anything is on fire, jump to §13.

### 10.2 Stripe webhook health

Stripe retries failed events with exponential backoff up to ~3 days. If
our endpoint is briefly down, no data is lost. But if events keep failing:

```bash
# Inspect our side
SELECT event_id, type, succeeded, error, received_at
FROM stripe_events
WHERE succeeded = false
ORDER BY received_at DESC
LIMIT 20;

# Inspect Stripe's side
# Dashboard → Developers → Webhooks → your endpoint → "Recent deliveries"
```

If a row is stuck at `succeeded=false` with the same `error` for hours,
the handler has a bug. Common causes:

- Stripe API version mismatch (a new field is now nullable; our parser
  assumes it).
- A foreign key insert fails because the user row doesn't exist (Clerk
  webhook lag — handle by upserting the user shell on Stripe webhook,
  not just on Clerk webhook).

Replay an event after fixing:

```bash
# Stripe Dashboard → Events → click event → "Resend"
# Our handler will pick it up, since stripe_events.succeeded=false means
# we have NOT processed it (idempotency check passes).
```

### 10.3 Membership state reconciliation

A nightly Vercel Cron (`/api/cron/reconcile-memberships`) walks all
`memberships` rows where `status = 'ACTIVE'` and verifies against Stripe
that the subscription is still active. Drift fixes itself on the next
webhook, but if a webhook was silently dropped, the cron catches it within
24h.

To run on demand:

```bash
curl -X POST https://kclub.example.com/api/cron/reconcile-memberships \
  -H "Authorization: Bearer $CRON_SECRET"
```

`CRON_SECRET` is Vercel-managed; see Vercel Cron docs.

### 10.4 Audit log retention

`audit_logs` grows monotonically. Current policy: keep forever; review at
year 1 (estimated row growth ~100k/month at design traffic). Add
partitioning by `created_at` when the table exceeds 10M rows.

---

## 11. Secret rotation

Source of truth for rotation policy: `/docs/ENV.md` § "Rotation playbook".
This section is the operational procedure.

### 11.1 General rule

- Rotate one secret at a time.
- Always verify before moving to the next.
- Never rotate two vendors in the same deploy window.
- Pre-announce in #engineering at least 1h before rotation if other
  developers are likely to be coding.

### 11.2 Procedure: Clerk secret key

```
1. Clerk Dashboard → API Keys → click the secret → "Rotate".
2. Old key is now in 24h grace window — both old + new keys work.
3. Update Vercel production env: CLERK_SECRET_KEY = new value.
4. Trigger a Vercel redeploy (Settings → Deployments → "Redeploy" with
   "Use existing build cache" off).
5. Wait for deploy. Smoke test sign-in.
6. Update Vercel preview env (same scope).
7. Update CI secret if used by integration tests.
8. After 24h grace, the old key dies automatically.
```

### 11.3 Procedure: Stripe webhook secret

```
1. Stripe Dashboard → Webhooks → endpoint → "Roll secret".
2. The OLD secret remains valid for 24h.
3. Update Vercel env: STRIPE_WEBHOOK_SECRET = new value.
4. Redeploy.
5. Send a test event from Stripe → "Send test webhook". Verify 200.
6. After 24h the old secret stops working.
```

If you forget step 4 within 24h, Stripe events start returning 400 from
our endpoint. Stripe retries — no data loss — but Sentry alerts go off.

### 11.4 Procedure: Database password

```
1. Schedule a maintenance window. Brief (~30s) downtime expected.
2. Supabase Dashboard → Project → Settings → Database → "Reset password".
3. Update Vercel env: DATABASE_URL + DATABASE_URL_DIRECT (both).
4. Redeploy (this is the downtime).
5. Smoke test: open the site, click a page that hits the DB.
6. Notify team: rotation complete.
```

### 11.5 Anything else

See `/docs/ENV.md` rotation playbook table for window + downtime per
secret. Procedure is structurally the same: rotate at vendor, update env,
redeploy, verify.

---

## 12. Backups and disaster recovery

### 12.1 What's backed up

| Asset           | Where                           | Frequency                                               | Retention                   |
| --------------- | ------------------------------- | ------------------------------------------------------- | --------------------------- |
| Postgres        | Supabase automatic backups      | daily                                                   | 7 days (paid tier: 30 days) |
| Postgres (PITR) | Supabase Point-in-Time Recovery | continuous                                              | 7 days                      |
| Clerk user data | Clerk's own backups             | vendor-managed                                          | per Clerk SLA               |
| Stripe events   | Stripe's own retention          | forever (Stripe side); 90d in our `stripe_events` table |
| Code            | GitHub                          | git is the backup                                       | forever                     |
| Secrets         | 1Password vault "KCLUB ops"     | manual on rotation                                      | forever                     |

### 12.2 RPO / RTO targets (MVP)

- **RPO** (data loss tolerance): 24 hours.
- **RTO** (time to restore service): 4 hours.

These are MVP-class numbers. They'll tighten as paying users accumulate.

### 12.3 Restore procedure (Postgres)

```
1. Identify the target restore point.
2. Supabase Dashboard → Database → Backups → select date → "Restore".
3. Supabase creates a new DB. Get the new connection strings.
4. Update Vercel env DATABASE_URL + DATABASE_URL_DIRECT.
5. Redeploy.
6. Verify: smoke test + spot check on known recent data.
7. Decommission the old DB only after 7 days of clean operation.
```

PITR procedure is the same but with a "Restore to point in time" option.

### 12.4 Full system loss

If GitHub, Vercel, and Supabase all disappear simultaneously, you have
bigger problems than this runbook can solve. We accept this risk at
MVP. Mitigation in the long run: weekly `pg_dump` to S3 in a different
provider; daily mirror of GitHub repo to a self-hosted Gitea.

---

## 13. Incident response

### 13.1 Severity levels

| SEV | Definition                                | Response time     | Comms                       |
| --- | ----------------------------------------- | ----------------- | --------------------------- |
| 1   | Site down, payments broken, PII leak      | 15 minutes        | All-hands; status page red  |
| 2   | Major feature broken; revenue not blocked | 1 hour            | On-call; status page yellow |
| 3   | Minor bug visible to users                | next business day | normal ticket               |
| 4   | Internal-only or non-user-visible         | when planned      | normal ticket               |

### 13.2 Steps for SEV-1

```
1. Acknowledge in #incidents within 5 minutes. Even just "I see it".
2. One person becomes Incident Commander (IC). Everyone else supports.
3. IC posts a timeline doc in /incidents/<YYYY-MM-DD>-<slug>.md.
   Update it every 15 minutes minimum.
4. Mitigate first, root-cause later. Acceptable mitigations:
   - Roll back the most recent deploy.
   - Disable the broken feature behind a kill switch.
   - Stop accepting webhooks temporarily (NOT for Stripe — Stripe will
     retry, but they retry only for ~3 days; longer outages cause data
     loss on our reconciliation cron).
5. When the bleeding stops, write the timeline, identify root cause,
   open a follow-up PR with a regression test.
6. Post-mortem within 48 hours. Blameless. Action items must be filed
   as issues with owners.
```

### 13.3 PII leak procedure

If member PII (email, full name, payment data) escaped our system:

```
1. Stop the leak. Disable the leaking endpoint, revert the leaking deploy.
2. Identify scope: which users, which fields, how long was it exposed.
3. Notify the affected users — direct email within 72 hours
   (legal requirement in most jurisdictions; see /docs/SECURITY.md).
4. Notify the data protection authority if EU/UK users affected.
5. Document in the post-mortem. Add a Playwright test that would have
   caught the leak. Add the test to the PII contract suite.
```

The `/verify-card` PII assertion test in §7.4 exists exactly to prevent
this class of incident from recurring silently.

---

## 14. Troubleshooting catalog

The high-frequency stuff. Add new entries here when you hit something
that surprised you.

### 14.1 `pnpm install` fails with peer-dep warnings

Try: `pnpm install --strict-peer-dependencies=false`. Long-term fix:
upgrade the offending dep or pin a resolved version. Document the
resolution in `package.json` `pnpm.overrides`.

### 14.2 `Cannot find module 'server-only'`

You imported a server-only module from a client component. Look at the
import chain. Move the call to a server action or RSC.

### 14.3 `Hydration failed because the initial UI does not match`

Common causes:

- Date / time formatting that uses the local timezone in RSC but UTC on
  the client (or vice versa). Fix by formatting on the server.
- `Math.random()` in a render path. Fix by computing the value in an
  effect or on the server.
- `next-intl` formatter set to the user's locale on client but default
  on server. Fix by passing the same `locale` prop.

### 14.4 Stripe webhook returns 400 in production but 200 in dev

The `STRIPE_WEBHOOK_SECRET` env var doesn't match the endpoint's signing
secret in Stripe Dashboard. Re-copy from the dashboard. Note: a webhook
_endpoint_ has its own secret; you'll have separate values for the dev
CLI listener vs production endpoint vs preview endpoint.

### 14.5 `auth()` returns `{ userId: null }` for a clearly signed-in user

In Clerk v6 you must `await auth()`. If the result destructures fine but
`userId` is `null`, the middleware did not run for that route. Check
`src/middleware.ts` `matcher` — `/api/*` and dynamic routes are common
omissions.

### 14.6 Migration runs but tables don't appear

You ran the migration against the wrong database. The pooled URL points
to the same DB as the direct URL in Supabase (just different ports), so
this normally isn't the cause. More likely: you ran it against your
personal Supabase project instead of the team's. Check `psql` output for
the host.

### 14.7 `pnpm verify` fails on `vocab:check`

You committed a forbidden term (see `AGENTS.md §4`). The grep prints the
exact file and line. Either rephrase or, if the term is part of a
discussion _about_ the forbidden vocab (e.g. inside `docs/GUARDRAILS.md`),
the grep already excludes that file.

### 14.8 Tailwind classes don't apply

For Tailwind v4: check `app/globals.css` has `@import "tailwindcss";`.
For class-purging issues, ensure the file with the class is included by
the `content` glob in the Tailwind config — by default `src/**/*.{ts,tsx}`
and `app/**/*.{ts,tsx}`.

### 14.9 Local `pnpm dev` works, Vercel preview crashes on the same code

The most common cause is a missing env var in the Vercel preview scope.
Run `pnpm env:check` and cross-reference with Vercel's env vars dashboard.

Second most common: `import "server-only"` is missing on a module that
worked in dev because Vite-style HMR was lenient. Add it; rebuild.

### 14.10 "Too many connections" against Postgres

Did you run `db:migrate` while `pnpm dev` was also running? They share
the pool. Stop dev, run migrate, start dev.

If it's production: spike in serverless invocations exceeded the pooled
connections (default ~60 on Supabase free tier). Mitigation: either raise
the Supabase tier, or reduce `connection_limit` in the URL to force more
queuing.

---

## 15. Periodic chores

A short list. Owner reviews quarterly.

| Frequency | Task                                                             | Owner       |
| --------- | ---------------------------------------------------------------- | ----------- |
| Weekly    | Triage Renovate PRs (deps updates). Merge greens, queue rest.    | tech lead   |
| Weekly    | Review Sentry top issues, file tickets or close.                 | tech lead   |
| Monthly   | Check Stripe API version vs our pin; plan upgrade if behind > 1. | billing     |
| Monthly   | Review forbidden-vocab grep — anything we should add?            | tech lead   |
| Quarterly | Rotate `SENTRY_AUTH_TOKEN`.                                      | observ.     |
| Quarterly | Review ADRs in `/docs/STACK-DECISION.md` — any need supersede?   | tech lead   |
| Quarterly | Restore-from-backup drill (restore Postgres to a test instance). | platform    |
| Quarterly | Renew SSL cert? — handled by Vercel automatically; verify.       | platform    |
| Yearly    | Re-audit `/docs/SPEC.md` legal section with counsel.             | legal owner |
| Yearly    | Penetration test scope review.                                   | security    |

Stale items → reassign or remove from the table. An untracked chore is a
chore that won't happen.
