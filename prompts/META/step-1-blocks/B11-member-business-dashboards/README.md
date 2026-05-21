# B11: Member Business Dashboards

## Overview

This block outlines the step-by-step instructions for implementing the **Member Business Dashboards** functionality in the KYLYVNYK CLUB project.

## Steps

1. **[FREE Member Dashboard â€” card, catalog access, special conditions, upgrade to VIP](./01-free-member-dashboard.md)**
   Create the member home that: - Ensures a digital card exists for the user. - Shows the card panel. - Promotes Catalog (special conditions are visible after signâ€‘in). - Provides clear upgrade to VIP CTA.

2. **[VIP Dashboard â€” VIP access overview + Business Introduction entry point](./02-vip-dashboard-and-bi-entry.md)**
   Create a VIP dashboard page with: - VIP access confirmation and benefits. - Entry to â€œBusiness Introductionâ€ request (VIPâ€‘only). - Links to Business tools and Subscription.

3. **[02-vip-member-dashboard.md](./02-vip-member-dashboard.md)**

4. **[Submit Business (VIP-only) â€” MVP fields, validation, UNDER_REVIEW status](./03-submit-business-form.md)**
   Allow VIP members to submit exactly one business for review. Fields (MVP): - business name, representative name, email, phone, country, city, category, website/social link, short description.

5. **[Status Panels â€” business profile publication + subscription state](./04-business-and-subscription-status.md)**
   Provide simple, readable panels for: - Current userâ€™s business profile (status + basic info). - Stripe subscription status (statusRaw, currentPeriodEnd, cancelAtPeriodEnd).

6. **[04-business-profile-and-subscription-status.md](./04-business-profile-and-subscription-status.md)**

7. **[Subscription Management â€” view/cancel with Portal access](./05-subscription-management-ui.md)**
   Provide a consolidated, mobile-first UI for subscription management within /member/subscription.

8. **[05-subscription-management.md](./05-subscription-management.md)**

9. **[Activity Log â€” minimal recent actions for the current user](./06-activity-log-minimal.md)**
   Show a minimal list of recent actions (last 20) performed by the current user for transparency and support.

## Overall Acceptance Criteria

Upon completion of this block:

- All configuration and implementations described in the steps are completed.
- The application runs correctly without errors.
- Code aligns with the project's quality and architectural standards.
