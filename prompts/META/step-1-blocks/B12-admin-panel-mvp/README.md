# B12: Admin Panel Mvp

## Overview

This block outlines the step-by-step instructions for implementing the **Admin Panel Mvp** functionality in the KYLYVNYK CLUB project.

## Steps

1. **[Admin Access â€” role ADMIN + MFA requirement](./01-admin-access-guard-mfa.md)**
   Harden admin area access using requireAdminWithMfa guard. Provide an Admin layout with sidebar navigation and route skeletons.

2. **[Admin Tables â€” Users, Businesses, Categories, Countries, Subscriptions (SSR minimal)](./02-admin-tables.md)**
   Render basic server-side tables for core entities with essential columns and simple pagination. No client data grid yet (TanStack planned in Step 3).

3. **[02-tables-users-businesses-categories-countries-subs.md](./02-tables-users-businesses-categories-countries-subs.md)**
   

4. **[Business Moderation â€” UNDER_REVIEW â†’ PUBLISHED/HIDDEN + flags](./03-business-moderation-workflow.md)**
   Provide admin controls to: - Publish or hide a business. - Toggle Top Partner / Recommended flags. - Set publishedAt upon publish. - Log actions to AuditLog.

5. **[VIP Status Management â€” visibility + manual override + Stripe linking helper](./04-vip-status-and-stripe-linking.md)**
   Provide admin with: - Read-only view of a userâ€™s current subscription/membership. - Manual override to create/update Membership (VIP with valid_to). - Helper to find Stripe customer by email and open customer portal (for support). Note: Stripe remains source of truth. Manual override is for support-only.

6. **[05-business-introductions-stub.md](./05-business-introductions-stub.md)**
   

7. **[Business Introductions â€” admin management stub (no MLM, no payouts)](./05-introductions-management-stub.md)**
   Provide a simple admin UI to review â€œIntroductionsâ€: - List recent INTRODUCTIONS with status. - Change status to APPROVED/REJECTED/CLOSED. - Store internal notes (admin only). - Log changes.

8. **[Audit Logs â€” minimal admin viewer (recent CRUD events)](./06-audit-logs-minimal.md)**
   Provide a minimal, read-only list of recent audit logs with paging.

## Overall Acceptance Criteria

Upon completion of this block:
- All configuration and implementations described in the steps are completed.
- The application runs correctly without errors.
- Code aligns with the project's quality and architectural standards.
