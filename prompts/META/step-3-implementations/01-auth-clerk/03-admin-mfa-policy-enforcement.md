# 01-auth-clerk/03-admin-mfa-policy-enforcement.md

## Title

Admin MFA Policy Enforcement

## Objective

Гарантировать, что администраторы (пользователи с ролью ADMIN в БД) включили и прошли двухфакторную аутентификацию (MFA) при доступе к админ-панели.

## Files

### src/features/auth/server/guards.ts (additions)

```ts
export async function requireAdminWithMfa() {
  const userId = await requireAuth();
  const membership = await getUserTier(userId);
  if (!membership || membership.tier !== 'ADMIN') {
    redirect('/dashboard');
  }

  const { sessionClaims } = auth();
  // Clerk добавляет acr/amr claims при прохождении MFA, например 'mfa' в amr
  const amr = sessionClaims?.amr as string[] | undefined;
  if (!amr || !amr.includes('mfa')) {
    // Пользователь имеет права админа, но не прошел MFA. Отправляем на включение/подтверждение MFA
    redirect('/security/mfa-setup'); // Страница для включения 2FA в профиле Clerk
  }

  return userId;
}
```

## Acceptance
- Пользователи с `tier === 'ADMIN'` без MFA перенаправляются.
- Роль ADMIN надежно защищена.