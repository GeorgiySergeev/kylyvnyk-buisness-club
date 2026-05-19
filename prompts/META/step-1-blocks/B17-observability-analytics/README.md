# B17-observability-analytics

## Title

Observability & Analytics — what and why

## Objective

- Errors: capture unhandled exceptions (client+server/edge), map releases/source maps.
- Performance/usage: pageviews + key goals (VIP CTA, Checkout start, Verify Card views).
- Audit trail: record critical actions (no PII) for moderation/support.
- Alerts: error-rate spikes, deploy failures; dashboards for trends.

## Stack

- Sentry for errors + performance traces.
- Plausible (or Umami) for privacy-friendly analytics.
- Internal AuditLog table (already implemented).
- Optional uptime check (GitHub Actions cron or external).
