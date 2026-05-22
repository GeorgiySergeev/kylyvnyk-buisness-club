 **KCLUB-MVP — cold start (B03.02+)**

You are a senior full-stack engineer on **KYLYVNYK CLUB (kclub-mvp-V2)** — private business club (digital card, partner directory, admin-mediated **Business Introductions**). MVP scope is **without Stripe** (see `docs/sprints/kclub--mvp--sptint-1.md`).

## Read first (in order)

1. `/AGENTS.md`
2. `/docs/STACK-DECISION.md` — especially **ADR-003** (DB), ADR-004 (Clerk, later)
3. `/prompts/META/INDEX.md` — phase order + superseded prompts
4. `/docs/sprints/kclub--mvp--sprint-3.md` — **current playbook** for database work
5. `/.cursor/rules/11-supabase-pg-pooling.mdc`

Do **not** follow obsolete B03 scaffolds:

- `prompts/META/step-1-blocks/B03-database-drizzle-base/01-postgres-connection-setup.md` (pg/node-postgres) — **superseded**
- `prompts/META/step-1-blocks/B03-database-drizzle-base/02-drizzle-config-and-migrations.md` (DATABASE_URL in kit) — **superseded**
- `prompts/META/step-1-blocks/B03-database-drizzle-base/03-initial-empty-schemas.md` (flat layout) — **superseded by sprint-3 + step-2**

## Frozen stack (do not change without ADR)

- Node 20.18, pnpm 9.x, Next.js 15 App Router, React 19, TS strict
- DB: Supabase Postgres **connection string only** (no `@supabase/supabase-js`)
- ORM: Drizzle `^0.36` + drizzle-kit `^0.28`
- Driver: **postgres-js** (`postgres` package), **NOT** `pg` / `node-postgres`
- Auth/i18n (not installed yet): Clerk v6, next-intl v3 — come in sprint-2 B02, not this task unless asked

## What is already done (B03.01 — do NOT redo)

- `drizzle.config.ts`: `DATABASE_URL_DIRECT` via `dotenv` (`.env.local` + `.env`). **Never** import `@/lib/env` here (`server-only` breaks drizzle-kit CLI).
- `src/db/client.ts`: single `postgres()` client, `prepare: false`, `max: 10`, `idle_timeout: 30`, `import "server-only"`, imports `@/lib/env`, `drizzle-orm/postgres-js`, schema from `./schema`.
- `src/db/schema/index.ts`: empty stub (`export {}`) — ready for B03.02+.
- `package.json` scripts: `db:generate`, `db:migrate`, `db:push` (disabled), `db:studio`, `db:seed`.
- Deps installed: `drizzle-orm`, `postgres`, `drizzle-kit`, `tsx`, `dotenv`.
- Verified green: `pnpm typecheck`, `pnpm build`, `pnpm db:generate` (0 tables — expected).

**Hard rules (ADR-003):**

- `DATABASE_URL` (port 6543, PgBouncer) → app runtime only, `prepare: false`
- `DATABASE_URL_DIRECT` (port 5432) → drizzle-kit / migrations only
- **One** `postgres()` client in the whole repo: `src/db/client.ts`
- All app queries: `import { db } from '@/db/client'`

## Current task: B03.02 — Drizzle pg enums

Follow **`docs/sprints/kclub--mvp--sprint-3.md` section "Шаг B03.02"** exactly.

Create 5 files under `src/db/schema/enums/`:

| File | pgEnum name | Values |
|------|-------------|--------|
| `user-role.ts` | `user_role` | FREE, BUSINESS, ADMIN |
| `user-status.ts` | `user_status` | ACTIVE, INACTIVE, BANNED |
| `business-status.ts` | `business_status` | DRAFT, PENDING, PUBLISHED, HIDDEN |
| `card-status.ts` | `card_status` + `card_member_type` | ACTIVE, INACTIVE, EXPIRED + VIP, BUSINESS, FREE |
| `introduction-status.ts` | `introduction_status` | SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, CLOSED |

Pattern per file:

```ts
import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["FREE", "BUSINESS", "ADMIN"]);
export type UserRole = (typeof userRoleEnum.enumValues)[number];
