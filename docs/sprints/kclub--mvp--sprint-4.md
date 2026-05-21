# B04 — Auth + Onboarding Playbook

Перед стартом:

```bash
git checkout main && git pull
git checkout -b feat/b04-auth-onboarding

pnpm lint && pnpm typecheck && pnpm build
# → всё зелёное (база B03)

# убедиться что seed данные есть
pnpm db:studio
# → таблица users — 4 записи
```

---

## Что строим в B04

```
B04.01  Clerk webhook → создание/обновление/удаление users в нашей БД
B04.02  getCurrentUser helpers + типы ролей
B04.03  Onboarding страница + форма профиля
B04.04  Post-signup redirect (новый user → onboarding, старый → dashboard)
B04.05  Role guards (BUSINESS-only, ADMIN-only маршруты)
B04.06  Audit log helper + логирование ключевых событий
```

На выходе: пользователь регистрируется через Clerk → автоматически создаётся строка в `users` → попадает на onboarding → заполняет профиль → попадает в dashboard. Роли проверяются везде.

---

## Шаг B04.01 — Clerk webhook handler

Это самый критичный шаг B04. Без него регистрация через Clerk не создаёт запись в нашей БД, и все запросы `getCurrentUser()` будут возвращать `null`.

### Подшаг 1 — установить svix (руками)

```bash
pnpm add svix
```

### Подшаг 2 — настроить Clerk webhook в Dashboard

Перед написанием кода — сначала настройте endpoint в Clerk:

```
1. Clerk Dashboard → Webhooks → Add Endpoint
2. URL: https://YOUR_NGROK_URL/api/clerk/webhook
   (в dev используем ngrok, см. RUNBOOK §5.2)
   В prod: https://kclub.example.com/api/clerk/webhook
3. Subscribe to events:
   - user.created ✓
   - user.updated ✓
   - user.deleted ✓
4. Скопировать Signing Secret → .env.local → CLERK_WEBHOOK_SECRET=whsec_...
```

Если ngrok не настроен:

```bash
# Terminal 1:
pnpm dev

# Terminal 2:
ngrok http 3000
# копируете https://xxxx.ngrok-free.app
# вставляете в Clerk Dashboard как URL endpoint
```

### Подшаг 3 — написать handler

Вставьте в Cursor/Codex:

```
Read /prompts/META/PATCHES/Patch-01-clerk-v6-async-auth.md.
Read /.codex/skills/03-clerk-v6.md (webhook handler section).
Read /docs/STACK-DECISION.md ADR-004.

Create the Clerk webhook handler.

CRITICAL rules:
- Verify signature using svix (NOT skip verification)
- user.deleted → soft delete (set deleted_at = now()), NOT hard delete
- All DB operations wrapped in try/catch
- Log each event to audit_logs table
- Return 200 for already-processed or unknown events (idempotent)
- Route handler must export runtime = 'nodejs' (not edge)

File: app/api/clerk/webhook/route.ts

Events to handle:
1. user.created:
   - INSERT into users: clerkUserId, email (from emailAddresses[0].emailAddress),
     displayName (from firstName + lastName, nullable), role 'FREE', status 'ACTIVE'
   - ON CONFLICT (clerk_user_id) DO UPDATE email, displayName, updatedAt
     (idempotent: safe to replay)
   - INSERT into audit_logs: action 'USER_CREATE', entityType 'user',
     entityId = new user.id, payload = { clerkUserId, email }

2. user.updated:
   - UPDATE users SET email, displayName, updatedAt
     WHERE clerkUserId = event.data.id AND deletedAt IS NULL
   - INSERT into audit_logs: action 'USER_UPDATE', diff in payload

3. user.deleted:
   - UPDATE users SET deletedAt = now(), status = 'INACTIVE', updatedAt = now()
     WHERE clerkUserId = event.data.id
   - INSERT into audit_logs: action 'USER_DELETE'
   - Do NOT: DELETE FROM users (preserve history)

Signature verification pattern (svix):
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  wh.verify(payload, headers) → throws if invalid

Files to create:
- app/api/clerk/webhook/route.ts (create)

Show me the diff.
```

**Что проверять в diff:**

```ts
// ✅ обязательные элементы

export const runtime = "nodejs"; // ← не edge

export async function POST(req: NextRequest) {
  // 1. Signature verification — первое, до любой логики
  const payload = await req.text();
  const headersList = await headers();
  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(payload, {
      "svix-id":        headersList.get("svix-id") ?? "",
      "svix-timestamp": headersList.get("svix-timestamp") ?? "",
      "svix-signature": headersList.get("svix-signature") ?? "",
    }) as WebhookEvent;
  } catch {
    // invalid signature — 400, не 401 (не раскрываем детали)
    return new Response("invalid signature", { status: 400 });
  }

  // 2. Handle events
  switch (evt.type) {
    case "user.created": await handleUserCreated(evt.data); break;
    case "user.updated": await handleUserUpdated(evt.data); break;
    case "user.deleted": await handleUserDeleted(evt.data); break;
    default:
      // unknown event → 200 (Clerk не будет retrying)
      return Response.json({ received: true });
  }

  return Response.json({ ok: true });
}

// ✅ user.created — idempotent upsert
async function handleUserCreated(data: UserJSON) {
  const email = data.email_addresses[0]?.email_address;
  if (!email) return; // Clerk гарантирует email, но защита не лишняя

  const displayName = [data.first_name, data.last_name]
    .filter(Boolean).join(" ") || null;

  const [user] = await db
    .insert(users)
    .values({
      clerkUserId: data.id,
      email,
      displayName,
      role: "FREE",
      status: "ACTIVE",
    })
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: { email, displayName, updatedAt: new Date() },
    })
    .returning();

  // audit log
  await db.insert(auditLogs).values({
    action: "USER_CREATE",
    entityType: "user",
    entityId: user.id,
    payload: { clerkUserId: data.id, email },
  });
}

// ✅ user.deleted — soft delete
async function handleUserDeleted(data: DeletedObjectJSON) {
  await db
    .update(users)
    .set({ deletedAt: new Date(), status: "INACTIVE", updatedAt: new Date() })
    .where(eq(users.clerkUserId, data.id!));

  await db.insert(auditLogs).values({
    action: "USER_DELETE",
    entityType: "user",
    entityId: data.id!,
    payload: { clerkUserId: data.id },
  });
}

// ❌ не должно быть
DELETE FROM users WHERE clerk_user_id = ?  // hard delete запрещён
auth()  // без await
```

### Подшаг 4 — протестировать webhook локально

```bash
# Terminal 1: dev server
pnpm dev

# Terminal 2: ngrok (если не запущен)
ngrok http 3000

# Terminal 3: проверка вручную через Clerk Dashboard
# Clerk Dashboard → Webhooks → ваш endpoint → "Send test webhook"
# Выбрать: user.created
# Нажать Send
```

Ожидаемый результат:

```bash
# В Terminal 1 (dev server logs):
# POST /api/clerk/webhook 200 in Xms

# В pnpm db:studio → таблица users
# Должна появиться запись с clerk_user_id из тестового события
```

Если `400 invalid signature`:

```
Webhook returns 400 invalid signature.
Check that CLERK_WEBHOOK_SECRET in .env.local matches
the Signing Secret from Clerk Dashboard → Webhooks → your endpoint.
The secret must start with whsec_...
Show me how the secret is read in the handler.
```

```bash
git add app/api/clerk/webhook/ package.json pnpm-lock.yaml
git commit -m "feat(b04): Clerk webhook handler — user create/update/delete + audit log"
```

---

## Шаг B04.02 — Auth helpers + роли

Вставьте в Cursor/Codex:

```
Read /prompts/META/PATCHES/Patch-01-clerk-v6-async-auth.md.
Read /.codex/skills/03-clerk-v6.md.

Create/update auth helper files.

1. src/features/auth/lib/current-user.ts (create or update)

   Exports:

   a) getCurrentUserOrThrow()
      - import "server-only"
      - const { userId } = await auth()  ← ASYNC, await required
      - if no userId → throw new AppError("UNAUTHENTICATED", 401)
      - query db for users row by clerkUserId
      - if no row → throw new AppError("USER_NOT_PROVISIONED", 401)
      - if user.deletedAt → throw new AppError("ACCOUNT_DELETED", 403)
      - if user.status === 'BANNED' → throw new AppError("ACCOUNT_BANNED", 403)
      - return user row

   b) getCurrentUser()
      - Same as above but returns User | null (no throws)
      - Use try/catch around getCurrentUserOrThrow()

   c) requireRole(role: UserRole | UserRole[])
      - Calls getCurrentUserOrThrow()
      - Checks user.role is in the allowed roles
      - Throws AppError("FORBIDDEN", 403) if not
      - Returns the user

2. src/lib/errors.ts (create)
   - AppError class extends Error
   - constructor(code: string, status: number, message?: string)
   - Fields: code, status, message
   - Used across server actions to return typed errors

3. src/features/auth/types.ts (create)
   - Re-export UserRole, UserStatus from @/db/schema
   - type AuthUser = typeof users.$inferSelect
   - type PublicUser = Pick<AuthUser, 'id' | 'displayName' | 'role' | 'status'>

Files:
- src/features/auth/lib/current-user.ts (create)
- src/lib/errors.ts (create)
- src/features/auth/types.ts (create)

Show me all diffs.
```

**Что проверять:**

```ts
// current-user.ts ✅
import { auth } from '@clerk/nextjs/server';
import 'server-only';

export async function getCurrentUserOrThrow() {
  const { userId } = await auth(); // ← await!

  if (!userId) throw new AppError('UNAUTHENTICATED', 401);

  const user = await db.query.users.findFirst({
    where: and(
      eq(users.clerkUserId, userId),
      isNull(users.deletedAt), // ← не возвращать удалённых
    ),
  });

  if (!user) throw new AppError('USER_NOT_PROVISIONED', 401);
  if (user.status === 'BANNED') throw new AppError('ACCOUNT_BANNED', 403);

  return user;
}

// ✅ requireRole
export async function requireRole(allowed: UserRole | UserRole[]) {
  const user = await getCurrentUserOrThrow();
  const roles = Array.isArray(allowed) ? allowed : [allowed];

  if (!roles.includes(user.role)) {
    throw new AppError('FORBIDDEN', 403);
  }

  return user;
}
```

```ts
// errors.ts ✅
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'AppError';
  }
}

// ❌ не должно быть
throw new Error('unauthorized'); // нетипизированная ошибка
```

```bash
pnpm typecheck
# → 0 errors

git add src/features/auth/ src/lib/errors.ts
git commit -m "feat(b04): getCurrentUser helpers, requireRole, AppError type"
```

---

## Шаг B04.03 — Onboarding страница

Вставьте в Cursor/Codex:

```
Read /docs/DESIGN.md §9.3 (Onboarding page spec).
Read /.codex/skills/06-testing-gates.md (form test pattern).

Create the onboarding page. This is shown to new users after sign-up,
before they can access the dashboard.

New users are identified by: users.displayName IS NULL
AND no profile row exists for them.

Files to create:

1. src/features/auth/schemas/onboarding.schema.ts
   Zod schema for the onboarding form:
   - displayName: z.string().min(2).max(80).trim()
   - countryId: z.number().int().positive()
   - cityId: z.number().int().positive().optional()
   - bio: z.string().max(500).trim().optional()
   export type OnboardingInput = z.infer<...>

2. src/features/auth/actions/complete-onboarding.action.ts
   "use server" + import "server-only"
   Steps:
   a) const user = await getCurrentUserOrThrow()
   b) Parse input with OnboardingSchema.safeParse()
      → if fail: return { ok: false, error: "VALIDATION_FAILED", fieldErrors }
   c) UPDATE users SET displayName, updatedAt WHERE id = user.id
   d) INSERT INTO profiles (userId, countryId, cityId, bio)
      ON CONFLICT (user_id) DO UPDATE SET countryId, cityId, bio, updatedAt
   e) INSERT INTO audit_logs: action 'USER_ONBOARDING_COMPLETE'
   f) Return { ok: true }

   Return type:
   | { ok: true }
   | { ok: false; error: 'VALIDATION_FAILED'; fieldErrors: Record<string, string[]> }
   | { ok: false; error: 'UNAUTHENTICATED' | 'INTERNAL' }

3. src/features/auth/components/OnboardingForm.tsx
   "use client"
   - react-hook-form + zodResolver(onboardingSchema)
   - Fields: Display Name, Country (Select), City (Select, filtered by country), Bio (Textarea)
   - Country/City selects are populated from props (server fetches the lists)
   - On submit: calls completeOnboarding server action
   - On success: router.push('/en/m/dashboard')
   - Show LoadingSpinner on submit
   - Show field-level errors using ErrorMessage component
   - City select: disabled until country is selected
   - When country changes: reset cityId, re-filter cities

4. app/[locale]/m/onboarding/page.tsx
   - Server Component
   - requireRole(['FREE', 'BUSINESS', 'ADMIN']) — must be logged in
   - Check if already onboarded:
     if user.displayName AND profile exists → redirect to /[locale]/m/dashboard
   - Fetch countries list: db.select from countries ORDER BY name
   - Fetch cities list: db.select from cities (all — client will filter by country)
   - Render:
     <PageWrapper>
       <div className="min-h-screen flex items-center justify-center py-12">
         <div className="w-full max-w-md">
           <h1 font-display text-display-m text-fg>Complete your profile</h1>
           <GoldDivider className="my-6" />
           <p text-body-s text-fg-muted mb-8>
             "Step 2 of 2 — Tell us about yourself"
           </p>
           <div bg-surface rounded-xl p-8 shadow-md border border-border>
             <OnboardingForm countries={countries} cities={cities} />
           </div>
         </div>
       </div>
     </PageWrapper>

Files:
- src/features/auth/schemas/onboarding.schema.ts (create)
- src/features/auth/actions/complete-onboarding.action.ts (create)
- src/features/auth/components/OnboardingForm.tsx (create)
- app/[locale]/m/onboarding/page.tsx (create)

Show me all diffs.
```

**Что проверять:**

`OnboardingForm.tsx` — паттерн form + zod + rhf:

```tsx
// ✅
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { type OnboardingInput, onboardingSchema } from '../schemas/onboarding.schema';

// ✅

export function OnboardingForm({ countries, cities }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
  });

  const selectedCountryId = watch('countryId');

  // filter cities by selected country
  const filteredCities = cities.filter((c) => c.countryId === selectedCountryId);

  const onSubmit = async (data: OnboardingInput) => {
    const result = await completeOnboarding(data);
    if (result.ok) {
      router.push('/en/m/dashboard');
    } else {
      // handle errors
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Display Name */}
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          {...register('displayName')}
          aria-describedby={errors.displayName ? 'displayName-error' : undefined}
          aria-invalid={!!errors.displayName}
        />
        {errors.displayName && (
          <ErrorMessage id="displayName-error" message={errors.displayName.message!} />
        )}
      </div>
      {/* ... Country, City, Bio ... */}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <LoadingSpinner size="sm" /> : 'Complete →'}
      </Button>
    </form>
  );
}

// ❌ не должно быть
fetch('/api/onboarding', { method: 'POST', body: JSON.stringify(data) });
// Server Action, не fetch
```

`complete-onboarding.action.ts` — порядок шагов:

```ts
// ✅ правильный порядок
'use server';

import 'server-only';

// ✅ правильный порядок

export async function completeOnboarding(raw: unknown) {
  // 1. Auth первым
  const user = await getCurrentUserOrThrow();

  // 2. Zod parse
  const parsed = onboardingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: 'VALIDATION_FAILED' as const,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // 3. DB operations
  try {
    await db
      .update(users)
      .set({ displayName: parsed.data.displayName, updatedAt: new Date() })
      .where(eq(users.id, user.id));

    await db
      .insert(profiles)
      .values({ userId: user.id, ...parsed.data })
      .onConflictDoUpdate({
        target: profiles.userId,
        set: { ...parsed.data, updatedAt: new Date() },
      });

    // 4. Audit log
    await db.insert(auditLogs).values({
      actorUserId: user.id,
      action: 'USER_ONBOARDING_COMPLETE',
      entityType: 'user',
      entityId: user.id,
    });

    return { ok: true as const };
  } catch (e) {
    log.error('completeOnboarding failed', { error: String(e), userId: user.id });
    return { ok: false as const, error: 'INTERNAL' as const };
  }
}
```

```bash
pnpm typecheck
# → 0 errors

pnpm dev
# открыть localhost:3000/en/m/onboarding
# → если не залогинены: редирект на sign-in (middleware)
# → если залогинены: страница onboarding с формой
```

```bash
git add src/features/auth/ app/\[locale\]/m/onboarding/
git commit -m "feat(b04): onboarding page — form, server action, Zod schema, profile creation"
```

---

## Шаг B04.04 — Post-signup redirect + onboarding guard

Вставьте в Cursor/Codex:

```
Create two pieces of redirect logic:

1. Post-signup redirect (after Clerk sign-up)
   When a user signs up via Clerk and lands on /en/m/dashboard for the first time,
   we need to redirect them to /en/m/onboarding if they haven't completed it.

   Create: src/features/auth/lib/check-onboarding.ts
   - import "server-only"
   - export async function checkOnboardingComplete(userId: string): Promise<boolean>
   - Checks: users.displayName IS NOT NULL
     AND profiles row exists for userId
   - Returns true if onboarding complete, false if not

2. Dashboard page — onboarding gate
   In app/[locale]/m/dashboard/page.tsx (create placeholder):
   - Server Component
   - const user = await getCurrentUserOrThrow()
   - const isComplete = await checkOnboardingComplete(user.id)
   - if (!isComplete) redirect('/en/m/onboarding')
   - Otherwise render:
     <PageWrapper>
       <h1>Welcome back, {user.displayName ?? 'Member'}</h1>
       <p text-fg-muted>Dashboard coming in B11.</p>
     </PageWrapper>

3. Update NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
   In .env.example and .env.local:
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/en/m/onboarding
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/en/m/dashboard

   Note: after sign-UP → onboarding first
         after sign-IN → dashboard (guard will redirect to onboarding if needed)

Files:
- src/features/auth/lib/check-onboarding.ts (create)
- app/[locale]/m/dashboard/page.tsx (create)
- .env.example — verify these vars are set correctly (show me current values)

Show me diffs for the two TS files.
Do NOT modify .env.local (I'll update it manually).
```

**Что проверять:**

```ts
// check-onboarding.ts ✅
import { and, eq, isNotNull } from 'drizzle-orm';
import 'server-only';

import { db } from '@/db/client';
import { profiles, users } from '@/db/schema';

export async function checkOnboardingComplete(userId: string): Promise<boolean> {
  const result = await db
    .select({ hasName: isNotNull(users.displayName), profileId: profiles.id })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!result[0]) return false;
  return !!result[0].hasName && !!result[0].profileId;
}
```

```ts
// dashboard/page.tsx ✅
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUserOrThrow();
  const isComplete = await checkOnboardingComplete(user.id);

  if (!isComplete) {
    redirect("/en/m/onboarding"); // ← next/navigation redirect
  }

  return (
    <PageWrapper>
      <h1 className="text-display-m font-display text-fg">
        Welcome back, {user.displayName ?? "Member"}
      </h1>
      <p className="text-body-m text-fg-muted mt-4">
        Dashboard — coming in B11.
      </p>
    </PageWrapper>
  );
}
```

После применения обновите `.env.local` вручную:

```bash
# открыть .env.local и убедиться:
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/en/m/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/en/m/dashboard
```

```bash
git add src/features/auth/lib/check-onboarding.ts \
        app/\[locale\]/m/dashboard/
git commit -m "feat(b04): post-signup redirect, onboarding gate, dashboard placeholder"
```

---

## Шаг B04.05 — Role guards для маршрутов

Вставьте в Cursor/Codex:

```
Update middleware.ts and create role-check utilities.

1. Update src/middleware.ts

   Add more specific route matchers:
   - isBusinessRoute: /:locale/m/introduce(.*)
     → requires role BUSINESS or ADMIN
   - isAdminRoute: /:locale/admin(.*)
     → requires role ADMIN (+ 2FA check — see next step)

   Current middleware only checks authentication.
   Role checks happen in the page/action level, NOT in middleware
   (middleware can't query DB efficiently at edge).

   Middleware responsibility:
   - authenticated? if not → redirect to sign-in
   - locale routing
   Middleware does NOT check roles — pages/actions do that.

   Keep middleware.ts clean — no DB imports.

2. Create src/features/auth/lib/role-guards.ts
   import "server-only"

   Three guard functions used at page level:

   a) guardBusiness()
      - const user = await getCurrentUserOrThrow()
      - if user.role not in ['BUSINESS', 'ADMIN'] → redirect('/en/m/dashboard')
        with a flash message hint (store in cookie or just redirect with param)
      - return user

   b) guardAdmin()
      - const user = await getCurrentUserOrThrow()
      - if user.role !== 'ADMIN' → redirect('/en')
        (don't reveal admin exists to non-admins)
      - return user

   c) guardOnboarded()
      - const user = await getCurrentUserOrThrow()
      - const complete = await checkOnboardingComplete(user.id)
      - if !complete → redirect('/en/m/onboarding')
      - return user

3. Create app/[locale]/m/introduce/page.tsx (placeholder)
   - await guardBusiness()  ← role check first
   - await guardOnboarded() ← then onboarding check
   - Render placeholder: <PageWrapper><h1>Recommend a Client</h1>
     <p>Coming in B07.</p></PageWrapper>

4. Create app/[locale]/admin/page.tsx (placeholder)
   - await guardAdmin()
   - Render placeholder: <PageWrapper><h1>Admin Panel</h1>
     <p>Coming in B12.</p></PageWrapper>

Files:
- src/middleware.ts (modify — minor: verify matchers are correct)
- src/features/auth/lib/role-guards.ts (create)
- app/[locale]/m/introduce/page.tsx (create — placeholder)
- app/[locale]/admin/page.tsx (create — placeholder)

Show me all diffs.
```

**Что проверять:**

```ts
// role-guards.ts ✅
import "server-only";
import { redirect } from "next/navigation";

export async function guardBusiness() {
  const user = await getCurrentUserOrThrow();

  if (user.role !== "BUSINESS" && user.role !== "ADMIN") {
    redirect("/en/m/dashboard");
    // redirect() throws internally in Next.js — no return needed
  }

  return user;
}

export async function guardAdmin() {
  const user = await getCurrentUserOrThrow();

  if (user.role !== "ADMIN") {
    redirect("/en"); // ← не /admin — не раскрываем маршрут
  }

  return user;
}

// ❌ не должно быть
if (user.role !== "ADMIN") return null // без redirect
if (!user) throw Error()  // используйте getCurrentUserOrThrow
```

Тестирование:

```bash
pnpm dev

# тест 1: зайти как FREE user
# открыть localhost:3000/en/m/introduce
# → должен редиректить на /en/m/dashboard

# тест 2: прямой переход на /en/admin
# без логина → /en/sign-in
# FREE/BUSINESS user → /en

# тест 3: зарегистрироваться новым аккаунтом через Clerk
# → после sign-up → /en/m/onboarding
# заполнить форму → /en/m/dashboard
# убедиться что в DB записался профиль:
pnpm db:studio  # profiles таблица
```

```bash
git add src/middleware.ts src/features/auth/lib/role-guards.ts \
        app/\[locale\]/m/introduce/ app/\[locale\]/admin/
git commit -m "feat(b04): role guards (guardBusiness, guardAdmin, guardOnboarded), route placeholders"
```

---

## Шаг B04.06 — Audit log helper

Вставьте в Cursor/Codex:

```
Create a reusable audit log helper that all features will use.

File: src/lib/audit.ts
import "server-only"

Type for audit actions (exhaustive, add to as we build features):
export const AUDIT_ACTIONS = {
  USER_CREATE:                'USER_CREATE',
  USER_UPDATE:                'USER_UPDATE',
  USER_DELETE:                'USER_DELETE',
  USER_ONBOARDING_COMPLETE:   'USER_ONBOARDING_COMPLETE',
  USER_ROLE_CHANGE:           'USER_ROLE_CHANGE',
  USER_BAN:                   'USER_BAN',
  BUSINESS_CREATE:            'BUSINESS_CREATE',
  BUSINESS_UPDATE:            'BUSINESS_UPDATE',
  BUSINESS_PUBLISH:           'BUSINESS_PUBLISH',
  BUSINESS_HIDE:              'BUSINESS_HIDE',
  BUSINESS_APPROVE:           'BUSINESS_APPROVE',
  BUSINESS_REJECT:            'BUSINESS_REJECT',
  INTRODUCTION_SUBMIT:        'INTRODUCTION_SUBMIT',
  INTRODUCTION_APPROVE:       'INTRODUCTION_APPROVE',
  INTRODUCTION_REJECT:        'INTRODUCTION_REJECT',
  INTRODUCTION_CLOSE:         'INTRODUCTION_CLOSE',
  CARD_CREATE:                'CARD_CREATE',
  CARD_REVOKE:                'CARD_REVOKE',
  ADMIN_LOGIN:                'ADMIN_LOGIN',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

Function: createAuditLog(params)
Params:
  - actorUserId?: string (nullable — system events)
  - action: AuditAction
  - entityType?: string
  - entityId?: string
  - payload?: Record<string, unknown>
  - ipAddress?: string

Implementation:
  - db.insert(auditLogs).values({ ... })
  - Catch errors internally, log with log.error, never throw
    (audit log failure must NEVER break the main flow)
  - Return void

File: src/lib/audit.ts (create)

Also update app/api/clerk/webhook/route.ts to use createAuditLog()
instead of manual db.insert(auditLogs) calls.
Show me the diff for both files.
```

**Что проверять:**

```ts
// audit.ts ✅
export async function createAuditLog(params: {
  actorUserId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  ipAddress?: string;
}): Promise<void> {
  try {
    await db.insert(auditLogs).values(params);
  } catch (e) {
    // ← НИКОГДА не бросать — audit log не ломает основной flow
    log.error("Failed to write audit log", {
      error: String(e),
      action: params.action,
    });
  }
}

// ✅ использование в webhook handler
await createAuditLog({
  action: AUDIT_ACTIONS.USER_CREATE,
  entityType: "user",
  entityId: user.id,
  payload: { clerkUserId: data.id, email },
});

// ❌ не должно быть
await createAuditLog(...); // без await в важных местах — потеряем лог
try { await createAuditLog(...) } catch { throw e } // нарушает "не бросать"
```

```bash
pnpm typecheck
# → 0 errors

git add src/lib/audit.ts app/api/clerk/webhook/
git commit -m "feat(b04): centralized audit log helper with typed actions"
```

---

## Финальная проверка B04

```bash
pnpm lint && pnpm typecheck && pnpm build
# → всё зелёное

pnpm vocab:check
# → 0 matches (нет запрещённых слов)
```

### Сквозной тест (5 минут руками)

```bash
pnpm dev
```

```
[ ] 1. Открыть localhost:3000/en
      → тёмная страница, Header с "Sign In" и "Join Now"   ✓

[ ] 2. Нажать "Join Now" → /en/sign-up
      → Clerk форма в тёмной теме                          ✓

[ ] 3. Зарегистрироваться новым аккаунтом
      → после регистрации → /en/m/onboarding               ✓

[ ] 4. Заполнить onboarding форму
      → Submit → /en/m/dashboard                           ✓

[ ] 5. pnpm db:studio → users таблица
      → новый пользователь с displayName                   ✓
      → profiles таблица → строка для нового пользователя  ✓
      → audit_logs → USER_CREATE + USER_ONBOARDING_COMPLETE ✓

[ ] 6. Выйти (Sign Out)
      → Header снова показывает "Sign In" / "Join Now"      ✓

[ ] 7. localhost:3000/en/m/dashboard без логина
      → редирект на /en/sign-in                            ✓

[ ] 8. localhost:3000/en/admin без логина
      → редирект на /en/sign-in                            ✓
```

Если все галочки:

```bash
git log --oneline
# feat(b04): centralized audit log helper
# feat(b04): role guards, route placeholders
# feat(b04): post-signup redirect, onboarding gate, dashboard placeholder
# feat(b04): onboarding page — form, server action, Zod schema
# feat(b04): getCurrentUser helpers, requireRole, AppError type
# feat(b04): Clerk webhook handler — user create/update/delete
# feat(b02): ...
# feat(b01): ...

git push origin feat/b04-auth-onboarding
# открыть PR → merge в main
```

---

## Типичные проблемы B04

### Webhook не срабатывает в dev

```
Clerk webhook returns connection refused or timeout.
This means ngrok is not running or the URL in Clerk Dashboard is outdated.

Steps:
1. Make sure pnpm dev is running on port 3000
2. Run: ngrok http 3000
3. Copy the new https://xxxx.ngrok-free.app URL
4. Update in Clerk Dashboard → Webhooks → your endpoint → Update URL
5. Copy the new Signing Secret → update CLERK_WEBHOOK_SECRET in .env.local
6. Restart pnpm dev to pick up new env
```

### `USER_NOT_PROVISIONED` после sign-in

Это значит: Clerk создал пользователя, но webhook не отработал (не создал строку в `users`).

```bash
# Проверить: webhook дошёл?
# Clerk Dashboard → Webhooks → Recent Deliveries
# Смотрим на user.created event — статус 200 или ошибка?

# Если ошибка webhook → исправить, потом вручную replay:
# Clerk Dashboard → Webhooks → event → "Resend"
```

### Redirect loop на `/en/m/onboarding`

```
There's a redirect loop: /onboarding → /onboarding → ...
This happens when checkOnboardingComplete() always returns false
even after data is saved.

Check:
1. Does the profile row actually exist in DB? (pnpm db:studio → profiles)
2. Does user.displayName have a value? (check users table)
3. The check queries users.displayName IS NOT NULL AND profiles.id IS NOT NULL
   Both conditions must be true to return 'complete'.
Show me src/features/auth/lib/check-onboarding.ts
```

### Форма onboarding не сабмитит

```
The onboarding form submits but nothing happens.
Most likely: the Server Action is not marked "use server"
or the form is not calling the action correctly.

In Next.js 15 with react-hook-form + Server Actions:
- The action must be called as: const result = await completeOnboarding(data)
- Not: <form action={completeOnboarding}> (that's a different pattern)
- The "use server" directive must be at the top of the action file
Show me OnboardingForm.tsx and complete-onboarding.action.ts
```

---

## Что готово после B04 и что дальше

После B04:

- ✅ Clerk → наша БД синхронизирована через webhook
- ✅ Новый пользователь: регистрация → onboarding → dashboard
- ✅ Роли: FREE / BUSINESS / ADMIN проверяются на страницах
- ✅ Audit log: каждое ключевое событие пишется в `audit_logs`
- ✅ `getCurrentUserOrThrow()` — единый helper для всех страниц
- ✅ `guardBusiness()`, `guardAdmin()`, `guardOnboarded()` — готовы

**Следующий: B06 — i18n routing** (короткий, 1-2 часа) → затем **B08 — Home page** (полноценная маркетинговая страница) → **B09 — каталог партнёров**.

B06 у нас уже частично настроен в B02 (`routing.ts`, middleware, `[locale]` папка). В B06 нужно только: добавить `not-found.tsx`, `error.tsx`, `loading.tsx` для каждого основного маршрута, и проверить что все существующие страницы правильно используют `useTranslations`.

Скажите «готов к B06» или «готов к B08» — B06 можно проскочить быстро или объединить с B08.
