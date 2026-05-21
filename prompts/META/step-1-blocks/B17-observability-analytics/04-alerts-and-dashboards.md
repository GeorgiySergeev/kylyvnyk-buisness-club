# 04-alerts-and-dashboards.md

## Title

Alerts & Dashboards — Sentry + Analytics + Uptime

## Objective

Establish practical, low-noise alerts and quick dashboards for MVP reliability.

## Steps

1. Sentry alerts

- Create an alert for “Error events per minute > 5 for 5 minutes” (production).
- Create an alert for “New Release: increase in error rate vs previous release by >50%”.
- Set notifications to Slack/Email.

1. Releases

- Enable release tracking: set SENTRY_RELEASE=github_sha in CI or let withSentryConfig infer it.
- Verify release markers appear in Sentry.

1. Analytics goals (Plausible)

- Create Goals:
  - VIP-CTA-Click
  - Checkout-Start (POST /api/stripe/checkout success)
  - Verify-Card-View
- Build a “Conversion” dashboard for last 7/30 days.

1. Uptime (optional)

- Use a simple external monitor (e.g., Better Uptime, UptimeRobot) to ping:
  - /
  - /catalog
  - /verify-card/test (if stable test number) or just /verify-card
- Alert on >1 failure in 5 minutes.

1. Runbook (docs)

- docs/ops/runbook.md with:
  - Common errors, how to rollback, how to mute noisy alerts, how to reprocess stuck Stripe events.

## CSP + privacy

- Ensure CSP updated for analytics (see 02 step).
- Keep analytics anonymized; avoid PII in events.

## Acceptance

- Sentry alert fires on forced error (test-only).
- Analytics dashboard shows goals with recent events.
- Optional uptime pinging reports green; alerts wired to channel.
