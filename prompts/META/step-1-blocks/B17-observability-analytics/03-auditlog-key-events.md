# 03-auditlog-key-events.md

## Title

AuditLog — key events definition and instrumentation

## Objective

Define the canonical set of audit events and ensure instrumentation exists at each critical action. Exclude PII from meta.

## Key events

- USER_SYNC — created/linked local user on first auth.
- BUSINESS_SUBMIT — VIP submitted a business for review.
- BUSINESS_PUBLISH / BUSINESS_HIDE / BUSINESS_UNDER_REVIEW — admin moderation state changes.
- BUSINESS_TOP_SET / BUSINESS_TOP_UNSET — toggle Top Partner flag.
- BUSINESS_REC_SET / BUSINESS_REC_UNSET — toggle Recommended flag.
- INTRODUCTION_SUBMIT — VIP submitted a BI request.
- INTRODUCTION_UPDATE — admin changed status/notes.
- STRIPE_WEBHOOK_RECEIVED — webhook received and validated (optional).
- SUBSCRIPTION_UPSERT — subscription row updated from webhook.
- ADMIN_VIP_UPSERT — admin manual override VIP valid_to.

## Implementation guidance

- Use features/audit/server/log.ts helper (already provided).
- Call logAudit(...) from:
  - Auth user sync (B04 roles/sync).
  - Business submit server action.
  - Admin business moderation actions.
  - Introduction submit/update actions.
  - Stripe webhook handler (after signature verify / before upsert).
  - Admin VIP upsert action.

## Meta rules

- Only IDs and status/enum values. No emails, phones, names in meta.
- Example meta: { businessId, prevStatus, nextStatus }.

## Acceptance

- Each listed action writes exactly one audit row.
- /admin/logs displays recent actions with actor email (if available) or “system”.
- No PII rendered or stored in meta payloads.
