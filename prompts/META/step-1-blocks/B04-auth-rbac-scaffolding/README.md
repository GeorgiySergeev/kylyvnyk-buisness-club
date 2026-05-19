# B04: Auth Rbac Scaffolding

## Overview

This block outlines the step-by-step instructions for implementing the **Auth Rbac Scaffolding** functionality in the KYLYVNYK CLUB project.

## Steps

1. **[Clerk install and base integration (Next.js App Router)](./01-clerk-install-and-basic-integration.md)**
   Install Clerk, wrap the app with ClerkProvider, and wire base middleware for auth-aware routing.

2. **[Auth pages (Sign-in/Sign-up) + email verification flow](./02-signin-signup-email-verification.md)**
   Create sign-in/sign-up pages using Clerk components. Ensure email verification is required and redirects are correct.

3. **[Roles and profile attributes â€” DB sync and role resolution](./03-roles-and-profile-attributes.md)**
   On first authenticated request, ensure a local users row exists, sync basic profile fields, and resolve role: ADMIN | VIP | FREE.

4. **[Role guards â€” server-side access control for route groups](./04-role-guards-and-middleware.md)**
   Protect member, business, and admin routes using server-side guards. Provide simple helpers and demo usage in layouts.

5. **[Admin MFA policy â€” enforce 2FA for admins](./05-admin-mfa-policy.md)**
   Require that admin users have MFA enabled. If not, redirect them to security settings before granting admin panel access.

6. **[Sessions and protected API routes (App Router)](./06-session-handling-and-protected-api.md)**
   Demonstrate session access on server, a protected API route, and a server action using Clerk auth().

## Overall Acceptance Criteria

Upon completion of this block:
- All configuration and implementations described in the steps are completed.
- The application runs correctly without errors.
- Code aligns with the project's quality and architectural standards.
