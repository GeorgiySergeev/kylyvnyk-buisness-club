# 04-password-policies-or-delegation.md

## Title

Password Policies — delegate to Clerk; client validators for future custom auth

## Objective

Use Clerk’s password policy controls for production. Provide reusable validators for potential custom forms (future-safe), without storing passwords in MVP.

## Steps

1) In Clerk Dashboard → Authentication → Password policy:
   - Enforce minimum length (>=8), mixed case, digit, and symbol.
   - Enable email verification (already on).
2) Add a local Zod validator for any password fields you might add later (e.g., change-password UI).
3) Document hashing best practices if ever storing passwords (bcrypt/argon2).

## Files to add

- src/lib/validation/password-policy.ts
- docs/security/passwords.md

### src/lib/validation/password-policy.ts

```ts
import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/[a-z]/, 'Must include a lowercase letter')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a digit')
  .regex(/[^A-Za-z0-9]/, 'Must include a symbol');

export type PasswordInput = z.infer<typeof passwordSchema>;
```

### docs/security/passwords.md

```md
# Passwords (Policy & Storage)

- MVP uses Clerk; do not store passwords in application DB.
- Configure password policy in Clerk Dashboard (min length, complexity, breach checks if available).
- If custom storage is ever added:
  - Use Argon2id (preferred) or bcrypt with cost factor tuned for ~250ms on your hardware.
  - Never store plaintext; use per-user salt (handled by algorithms).
  - Rate-limit login attempts and enforce MFA for admin accounts.
  - Use HTTPS everywhere; set Secure + HttpOnly + SameSite=Lax on cookies.
```

## Acceptance

- Clerk enforces strong password policy.
- Local validator is available if needed without persisting secrets.
- No password data stored in our DB in MVP.
