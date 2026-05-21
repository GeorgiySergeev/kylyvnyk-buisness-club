# NAMING-CONVENTIONS — KCLUB

The vocabulary of the codebase. When an agent has to invent a name, it picks
from these rules; never improvises.

> Mismatched names are the #1 source of merge conflicts in agent-generated
> codebases. Lock them down before B01.

---

## 1. Files and folders

| Kind                        | Convention                                                   | Example                                  |
| --------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| Source files                | `kebab-case.ts`                                              | `lookup-public.ts`                       |
| React components            | `PascalCase.tsx`                                             | `VerifyCardView.tsx`                     |
| Hooks                       | `use-<thing>.ts` (camelCase export)                          | `use-current-user.ts` → `useCurrentUser` |
| Server actions              | `<verb>-<noun>.action.ts`                                    | `create-business.action.ts`              |
| Route handlers (App Router) | App Router convention: `route.ts`                            | `app/api/stripe/webhook/route.ts`        |
| Tests                       | `<subject>.spec.ts` (unit) / `<subject>.e2e.ts` (Playwright) | `lookup-public.spec.ts`                  |
| Drizzle schema files        | one table per file, `kebab-case.ts`                          | `partner-offer.ts`                       |
| Drizzle relations           | central `_relations.ts`                                      | `src/db/schema/_relations.ts`            |
| Migrations                  | `drizzle-kit` default                                        | `0001_initial.sql` (auto)                |
| Locale messages             | `messages/<locale>/<namespace>.json`                         | `messages/en/billing.json`               |
| Docs                        | `UPPER-KEBAB.md`                                             | `STACK-DECISION.md`                      |
| Prompts                     | `<NN>-<kebab-slug>.md`                                       | `04-webhook-endpoint-and-idempotency.md` |
| Block folders               | `B<NN>-<kebab-slug>`                                         | `B05-billing-stripe`                     |

**No `index.ts` re-exports** in `src/`. Import from the leaf file. Reason:
agents otherwise generate barrel files that break tree-shaking and create
circular imports.

---

## 2. Folders inside `src/`

```
src/
  app/                  Next.js App Router (routes only)
  components/           Reusable UI; no business logic
  features/             Feature-first slices (auth, billing, cards, ...)
    <feature>/
      actions/          Server actions for this feature
      components/       UI specific to this feature
      lib/              Pure helpers for this feature
      schemas/          Zod schemas
  lib/                  Cross-feature helpers (stripe, clerk, log, rate-limit)
  db/
    client.ts
    schema/
      <table>.ts
      _relations.ts
  styles/               Tailwind tokens, globals
  i18n/                 next-intl config
  middleware.ts
```

Rule: **a file lives where its only consumer lives, until it has 2+
consumers — then it moves up.** No premature `lib/utils.ts` dumping ground.

---

## 3. Database

| Object      | Convention                        | Example                                               |
| ----------- | --------------------------------- | ----------------------------------------------------- |
| Table name  | `snake_case`, plural              | `partner_offers`, `stripe_events`                     |
| Column name | `snake_case`                      | `clerk_user_id`, `current_period_end`                 |
| Primary key | `id uuid` (unless documented)     | —                                                     |
| FK column   | `<referenced_table_singular>_id`  | `user_id`, `business_id`                              |
| Boolean     | `is_*` / `has_*`                  | `is_top_partner`, `has_2fa`                           |
| Timestamps  | `*_at`, always `timestamptz`      | `created_at`, `processed_at`                          |
| Soft delete | `deleted_at timestamptz`          | —                                                     |
| Index       | `<table>_<col(s)>_<kind>`         | `cards_number_ux` (unique), `profiles_country_id_idx` |
| Enum type   | `snake_case` SQL, `PascalCase` TS | SQL: `member_type` / TS: `MemberType`                 |
| Enum values | `UPPER_SNAKE`                     | `VIP`, `BUSINESS`, `FREE`                             |

Drizzle TS identifiers mirror SQL with camelCase:

```ts
export const partnerOffers = pgTable('partner_offers', {
  id: uuid('id').defaultRandom().primaryKey(),
  businessId: uuid('business_id').notNull(),
  // ...
});
```

---

## 4. TypeScript identifiers

| Kind                 | Convention                               | Example                |
| -------------------- | ---------------------------------------- | ---------------------- |
| Variables, functions | `camelCase`                              | `lookupCardPublic`     |
| Types, interfaces    | `PascalCase`                             | `PublicCardDTO`        |
| React components     | `PascalCase`                             | `VerifyCardView`       |
| Constants (env-ish)  | `UPPER_SNAKE`                            | `MAX_LOOKUPS_PER_MIN`  |
| Enums (TS)           | `PascalCase` name, `UPPER_SNAKE` members | `MemberType.VIP`       |
| Zod schemas          | `<noun>Schema`                           | `createBusinessSchema` |
| Zod inferred types   | `<Noun>Input` / `<Noun>Output`           | `CreateBusinessInput`  |
| Result types         | `Result<T, AppError>`                    | —                      |
| DTOs                 | `<Noun>DTO`                              | `PublicCardDTO`        |

No `I` prefix on interfaces. No `T` prefix on type aliases.

---

## 5. URL paths

| Surface              | Pattern                          | Example                                    |
| -------------------- | -------------------------------- | ------------------------------------------ |
| Public marketing     | `/<locale>/<page>`               | `/en/about`                                |
| Public verify        | `/<locale>/verify-card/<number>` | `/en/verify-card/VIP-UA-XXXXX`             |
| Auth                 | `/<locale>/sign-in`, `/sign-up`  | —                                          |
| Member area          | `/<locale>/m/<page>`             | `/en/m/dashboard`                          |
| Business area        | `/<locale>/b/<page>`             | `/en/b/offers`                             |
| Admin                | `/<locale>/admin/<resource>`     | `/en/admin/businesses`                     |
| API (route handlers) | `/api/<scope>/<resource>`        | `/api/stripe/webhook`, `/api/cards/lookup` |

URL slugs are `kebab-case`. Never camelCase in URLs.

---

## 6. Env vars

- **Always `UPPER_SNAKE`.**
- Prefix by vendor: `STRIPE_*`, `CLERK_*`, `UPSTASH_*`, `SENTRY_*`,
  `TURNSTILE_*`, `SUPABASE_*` (only `DATABASE_URL`, no `SUPABASE_ANON_KEY` —
  we don't use supabase-js).
- Server-only secrets: no `NEXT_PUBLIC_` prefix.
- Client-safe values: `NEXT_PUBLIC_*` prefix (and only those).
- Every new env var: append to BOTH `/.env.example` and `/docs/ENV.md`
  in the same commit.

---

## 7. Audit log actions

Format: `<NOUN>_<VERB>` in `UPPER_SNAKE`, both parts singular.

Approved verbs: `CREATE`, `UPDATE`, `DELETE`, `PUBLISH`, `UNPUBLISH`,
`APPROVE`, `REJECT`, `SUBMIT`, `CLOSE`, `LOGIN`, `LOGOUT`, `IMPERSONATE`,
`EXPORT`.

Examples: `USER_CREATE`, `BUSINESS_PUBLISH`, `INTRODUCTION_APPROVE`,
`CARD_REVOKE`, `ADMIN_LOGIN`.

Forbidden: `USER_CREATED` (past tense), `users.create` (dotted), `do_thing`.

---

## 8. Stripe object naming (our side)

- Stripe **product** → mirrored in `subscriptions.product_code` (`KCLUB_VIP`,
  `KCLUB_BUSINESS`).
- Stripe **price** → stored in `subscriptions.price_id` raw (`price_1...`).
- Stripe **event id** → `stripe_events.event_id` raw (`evt_1...`).
- Metadata keys on Stripe side: `kclub_user_id`, `kclub_membership_type`.
  Never put PII into metadata.

---

## 9. i18n keys

- Namespaces follow features: `auth`, `billing`, `cards`, `directory`,
  `admin`, `legal`, `common`.
- Key format: `<namespace>.<screen>.<element>`.
- Examples: `cards.verify.title`, `billing.checkout.cta`, `legal.footer.terms`.
- Plurals via ICU: `cards.list.count` → `"{count, plural, one {# card} other {# cards}}"`.
- No abbreviations: `btn` → `button`, `lbl` → `label`.

---

## 10. Commits and branches

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`,
  `test:`, `perf:`, `ci:`, `build:`.
- Scope: feature folder name or `agents`/`prompts`/`db`/`infra`.
- Examples:
  - `feat(billing): add stripe webhook idempotency`
  - `fix(cards): close stale-cache window on revoke`
  - `docs(agents): pin clerk v6 async auth`
- Branches: `<type>/<short-slug>`. Examples: `feat/stripe-webhook`,
  `chore/agents-index-patches`.

---

## 11. Anti-patterns to reject in review

- `data`, `info`, `obj`, `tmp`, `foo`, `helper` as identifiers.
- `utils.ts` files with more than 3 unrelated functions — split.
- Pluralizing types: `Users` should be `User` (the array is `User[]`).
- Component names with `Component` suffix.
- `IUserDTO`, `TUserDTO` (Hungarian prefixes).
- `process.env.X!` outside of `/lib/env.ts` — read env via a typed loader.
