# 02-signin-signup-email-verification.md

## Title

Auth pages (Sign-in/Sign-up) + email verification flow

## Objective

Create sign-in/sign-up pages using Clerk components. Ensure email verification is required and redirects are correct.

## Prereqs

- Configure in Clerk Dashboard:
  - Sign-in methods: Email + Password enabled.
  - Email address verification: Required for sign-up.
  - Allowed redirect URLs: <http://localhost:3000> and production domain.

## Steps

1) Create sign-in and sign-up routes under (auth) group.
2) Use <SignIn/> and <SignUp/> components.
3) Configure afterSignInUrl and afterSignUpUrl.
4) Provide links from landing CTAs to /sign-in and /sign-up.

## Files to add

- src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
- src/app/(auth)/sign-up/[[...sign-up]]/page.tsx

### src/app/(auth)/sign-in/[[...sign-in]]/page.tsx

```tsx
'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="container py-10">
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-6 shadow-soft">
        <SignIn
          appearance={{ elements: { card: 'bg-card text-fg' } }}
          afterSignInUrl="/"
          signUpUrl="/sign-up"
        />
      </div>
    </main>
  );
}
```

### src/app/(auth)/sign-up/[[...sign-up]]/page.tsx

```tsx
'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <main className="container py-10">
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-6 shadow-soft">
        <SignUp
          appearance={{ elements: { card: 'bg-card text-fg' } }}
          afterSignUpUrl="/"
          signInUrl="/sign-in"
        />
      </div>
    </main>
  );
}
```

Notes

- Email verification is enforced via Clerk Dashboard setting. After sign-up, Clerk will guide verification automatically.
- You can customize URLs later (e.g., to onboarding page).

## Acceptance

- /sign-in and /sign-up render Clerk widgets with dark theme.
- New users must verify email before full access.
- After sign-in/up redirects to "/" for now.
