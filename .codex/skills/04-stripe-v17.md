# Skill: Stripe v17 — MVP NOTE

## Status in MVP

**Stripe is NOT part of KCLUB-MVP.**

- No checkout flows
- No subscription management
- No webhook handler (placeholder route exists but is empty)
- No `STRIPE_*` env vars required to run the app

User roles (FREE / BUSINESS / ADMIN) are set manually by admin
in the MVP. There is no automated upgrade flow.

## What IS wired (stubs only)

```
app/api/stripe/webhook/route.ts  ← exists, returns 501 Not Implemented
```

## When Stripe lands (Phase-2)

Apply these patches FIRST:

- Patch-02: `current_period_end` from `items.data[0]`, not subscription root
- Patch-03: `ON CONFLICT DO NOTHING RETURNING id` for idempotency
- Pin `apiVersion: "2024-12-18.acacia"` in `src/lib/stripe/config.ts`

Until then — don't reference Stripe in any component or action.
If you see a PR that adds Stripe code — it's ahead of schedule.
