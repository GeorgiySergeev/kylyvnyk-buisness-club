# Code Review: KYLYVNYK CLUB (kclub-mvp-V2)

> Generated: 2026-06-09
> Scope: Full project — auth, billing, admin, database, middleware, API routes, tests

---

## 🔴 HIGH: Security

### 1. Dev auth bypass has no HMAC signature (`src/features/auth/lib/dev-auth.ts:3-5`)

The `DEV_PHONE_AUTH_COOKIE` is a base64url-encoded phone number with **no signed integrity check**. Anyone with local network access or via XSS can forge this cookie and impersonate any phone number in dev/test environments.

```ts
export function encodeDevPhoneAuthCookie(phone: string): string {
  return Buffer.from(phone, 'utf8').toString('base64url');
}
```

**Fix:** Add an HMAC signature using a dev-only secret key, even in non-production.

### 2. Cron route authorization gap (`src/app/api/cron/stripe-reconcile/route.ts:14`)

When `CRON_SECRET` env var is not set, the authorization check is **skipped entirely**:

```ts
if (cronSecret) {  // <-- if falsy, no auth required at all
  const authorization = request.headers.get('authorization');
  if (authorization !== `Bearer ${cronSecret}`) { ... }
}
```

**Fix:** Require `CRON_SECRET` to always be set, or return 404/401 when unconfigured.

### 3. Middleware loses prior cookies on `setAll` (`src/middleware.ts:71-77`)

Every call to `setAll` creates a **new `NextResponse.next()`**, discarding any cookies set by a previous `setAll` in the same request lifecycle:

```ts
response = NextResponse.next({ request });  // fresh response, prior cookies lost
```

**Fix:** Mutate the existing `response` object instead of replacing it entirely.

### 4. `guardPermission` redirects both branches, never allows (`src/features/auth/lib/permission-guards.ts:31-37`)

Logic is inverted — both the permitted and non-permitted paths redirect:

```ts
if (!permitted) {
  const adminAccess = await isSuperAdmin(user.id);
  if (!adminAccess) {
    redirect(localizeHref(locale, '/'));      // not superadmin -> home
  }
  redirect(localizeHref(locale, '/admin'));   // IS superadmin -> admin (never ALLOWs)
}
```

**Fix:** If `canAccess` returns true, return the user immediately. The redirect should only happen when access is denied.

---

## 🟠 HIGH: Bugs / Logic Errors

### 5. `setUserMembershipTier(FREE)` deactivates ALL active memberships (`src/features/billing/lib/membership-access.ts:224-236`)

```ts
await db
  .update(memberships)
  .set({ endsAt: now, status: 'INACTIVE', updatedAt: now })
  .where(
    and(
      eq(memberships.userId, userId),
      eq(memberships.status, 'ACTIVE'),  // matches VIP & BUSINESS too!
      isNull(memberships.deletedAt),
    ),
  );
```

If a user has both VIP and FREE memberships, calling `setUserMembershipTier(userId, FREE)` will set the VIP membership to INACTIVE.

**Fix:** Add a plan code filter or explicit exclusion of non-target tiers.

### 6. `syncAuthUser` has a fragile 1-second window for `isNew` (`src/features/auth/lib/sync-auth-user.ts:63`)

```ts
const isNew = upsertedBySupabaseId.createdAt.getTime() >= now.getTime() - 1000;
```

If the server clock jumps or a GC pause exceeds 1 second between `now` assignment and row return, a genuine INSERT could be classified as "not new" — causing audit events and onboarding checks to be skipped.

**Fix:** Use the row's returned `createdAt` compared to the actual `now` value stored earlier, or rely on the `ON CONFLICT` distinction (returning `xmax` in Postgres).

### 7. Two different action result type systems in admin module

- `AdminActionResult<T>` from `action-result.ts` (with `code: AdminActionErrorCode`)
- Local `ActionResult<T>` defined in `user-admin.action.ts:32` and `business-admin.action.ts:27` (with `{ error: string }`)

Consumers cannot uniformly handle errors across admin actions.

**Fix:** Unify all admin actions to use `AdminActionResult<T>`.

---

## 🟡 MEDIUM: Code Quality

### 8. Duplicate `slugify` function (`src/features/admin/actions/business-admin.action.ts:393-400`)

A local `slugify()` function duplicates `src/features/business/lib/slugify-business-name.ts`. Creates two divergent behaviors if one is updated but not the other.

**Fix:** Reuse the shared library function.

### 9. No service layer — admin actions call DB directly

Admin actions mix auth/validation with raw `db.query()` and `db.update()`. This prevents:
- Unit testing business logic without mocking server actions
- Consistent audit logging across action/API boundaries
- Reuse across server actions and API route handlers

**Fix:** Extract DB operations into a service layer (`/src/features/admin/lib/services/` or similar).

### 10. `getCurrentUser` does not verify MFA assurance level (`src/features/auth/lib/current-user.ts:45`)

The function checks Supabase auth but doesn't enforce MFA. The caller (`guardAdmin`) separately checks MFA — but there is a TOCTOU window between user load and MFA verification.

**Fix:** Accept an optional `requireMfa` parameter and verify within the same cached call.

### 11. Bulk imports process rows sequentially (`business-admin.action.ts:430`, `user-admin.action.ts:457`)

```ts
for (let i = 0; i < parsed.data.businesses.length; i++) {
  // individual inserts per row
}
```

500 rows = 500 sequential DB round-trips. Postgres-js can handle batch inserts.

**Fix:** Use `db.insert().values(bulkData)` with proper error isolation (savepoints per row).

### 12. Basic CSV escaping in `businesses-list.ts` (`src/features/admin/lib/businesses-list.ts:64-68`)

The `escapeCsvField` function handles commas and quotes but does not guard against Excel formula injection (leading `=`, `+`, `-`, `@` characters).

**Fix:** Prefix fields starting with `=`, `+`, `-`, or `@` with a single quote or tab.

---

## 🟢 LOW: Best Practices & Minor Issues

### 13. `AdminMobileCard` uses `<a>` instead of Next.js `<Link>` (`src/features/admin/components/admin-ui.tsx:240`)

```tsx
return <a className="block" href={href}>{inner}</a>;  // no client-side navigation
```

**Fix:** Use `Link` from `next/link` for SPA navigation and prefetching.

### 14. Turnstile bypass accepts dummy tokens (`src/lib/captcha/turnstile.ts:5-10`)

Any fake token like `"XXXX.dummy.token.XXXX"` passes validation in non-production. This should be gated behind `AUTH_DEV_PHONE_BYPASS_ENABLED` for consistency.

**Fix:** Add a secondary flag check alongside `NODE_ENV !== "production"`.

### 15. `createUserSchema` accepts empty string for email (`src/features/admin/schemas/admin.schema.ts:48`)

```ts
email: z.union([z.string().email(), z.literal('')]).optional(),
```

Normalization happens downstream (`email?.trim() ? ... : null`). Better to use `.transform()` in the schema itself.

**Fix:**
```ts
email: z.string().email().optional().or(z.literal('')).transform(v => v || null).optional(),
```

### 16. No `aria-*` attributes in admin form components (`src/features/admin/components/user-crud-form.tsx`)

Admin forms use bare `<form action={...}>` with `<Input>` but lack `aria-describedby` and `aria-invalid` on error state — contradicts AGENTS.md requirement for 44px tap targets and accessibility.

**Fix:** Pass `aria-describedby` linked to the error element, and set `aria-invalid` on error.

### 17. Unused `db/config.ts` file

The file at `src/db/config.ts` is empty (0 lines). Either remove or populate with connection configuration.

### 18. `membership-resolver.ts` redundant nullish coalescing (`src/features/billing/lib/membership-resolver.ts:46`)

```ts
return [...rows].sort(...)[0] ?? null;  // [0] on empty array is already undefined
```

The `?? null` is harmless but redundant.

---

## ✅ Strengths

| Area | Assessment |
|------|------------|
| **PII safety** | Strict DTOs for all public endpoints; `PUBLIC_CARD_DTO_KEYS` and `PUBLIC_BUSINESS_DTO_KEYS` enforce key sets |
| **Idempotency** | Stripe webhook uses `ON CONFLICT DO NOTHING` with `RETURNING` — excellent pattern |
| **Rate limiting** | Granular per-endpoint rate limiters with proper fail-open (non-prod) / fail-closed (prod) logic |
| **Auth caching** | `getCurrentUser` uses `React.cache()` for deduplication within a single render pass |
| **Turnstile** | Verified server-side, not just client-side; real IP forwarded to Cloudflare |
| **Audit trail** | Every write action logs to `auditLogs` table with actor, entity, and payload |
| **Test coverage** | Solid Vitest unit tests (37 files), PII contract tests (4), Playwright e2e (6 specs) |
| **i18n** | No hardcoded user-facing strings; all via `next-intl` namespaces with 3 locales |
| **DB schema** | Proper indexes, FK constraints, cascading deletes, centralized `_relations.ts` |
| **Server/client boundary** | Consistent use of `'use server'`, `'use client'`, and `import "server-only"` |

---

## Recommended Priority Order

| # | Fix | Impact |
|---|-----|--------|
| 1 | **#4** — `guardPermission` redirect bug | Blocks superadmin access |
| 2 | **#1** — Dev auth HMAC | Security hardening |
| 3 | **#3** — Middleware cookie loss | Session loss, potential auth failures |
| 4 | **#2** — Cron auth gap | Unauthenticated billing reconciliation |
| 5 | **#5** — Membership deactivation | Could corrupt billing state |
| 6 | Unify `AdminActionResult` types across admin module | Developer experience |
| 7 | Extract DB logic into service layer | Testability & maintainability |
| 8 | Convert bulk imports to batch inserts | Performance for 500-row imports |
