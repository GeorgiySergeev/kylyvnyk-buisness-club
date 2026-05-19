# 05-admin-mfa-policy.md

## Title

Admin MFA policy — enforce 2FA for admins

## Objective

Require that admin users have MFA enabled. If not, redirect them to security settings before granting admin panel access.

## Prereqs

- Clerk Dashboard: TOTP/Authenticator factor enabled.

## Steps

1) Create a guard requireAdminWithMfa().
2) In admin layout, use the stricter guard.
3) Provide a friendly message page if needed.

## Files to add/modify

- src/features/auth/server/guards.ts (add new function)
- src/app/(admin)/layout.tsx (use requireAdminWithMfa)
- src/app/(admin)/mfa-required/page.tsx (optional info page)

### src/features/auth/server/guards.ts (append)

```ts
import { clerkClient, auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithRole } from './roles';

export async function requireAdminWithMfa() {
  const { userId } = auth();
  if (!userId) redirect('/sign-in');

  const { role } = await getCurrentUserWithRole();
  if (role !== 'ADMIN') redirect('/');

  // Fetch Clerk user and verify 2FA
  const user = await clerkClient.users.getUser(userId);
  const twoFactorEnabled =
    // Clerk exposes aggregate flag and/or enabled second factors
    (user.twoFactorEnabled as boolean | undefined) ||
    (user?.totp?.enabled as boolean | undefined) ||
    (Array.isArray((user as any).backupCodes) && (user as any).backupCodes.length > 0);

  if (!twoFactorEnabled) {
    // Direct users to Clerk-managed security page
    redirect('/(auth)/sign-in'); // fallback
    // Alternatively, present instructions page:
    // redirect('/admin/mfa-required');
  }
}
```

### src/app/(admin)/layout.tsx (patch)

```tsx
import { ReactNode } from 'react';
import { requireAdminWithMfa } from '@/features/auth/server/guards';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminWithMfa();
  return <main className="container py-8">{children}</main>;
}
```

### src/app/(admin)/mfa-required/page.tsx (optional)

```tsx
export default function AdminMfaRequiredPage() {
  return (
    <main className="container max-w-2xl py-10">
      <h1 className="h2">Two‑Factor Authentication required</h1>
      <p className="mt-3 body">
        Admin access requires 2FA. Please open your account security settings and enable an
        authenticator app (TOTP). After enabling 2FA, revisit the admin panel.
      </p>
      <ul className="mt-5 list-disc pl-6 body-sm text-fgMuted">
        <li>Open "Manage account" → "Security"</li>
        <li>Enable authenticator (TOTP) and store backup codes</li>
        <li>Sign out and sign in again if needed</li>
      </ul>
    </main>
  );
}
```

Notes

- Clerk's exact properties for 2FA may evolve; the guard checks multiple hints. Adjust to official SDK typings in your version.
- You can also enforce organization-based admin with SSO later.

## Acceptance

- Admins without MFA are redirected away from /admin.
- Admins with MFA proceed to the panel normally.
