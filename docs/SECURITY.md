# Security Notes

## Authentication

KCLUB uses Supabase Auth for phone-first member authentication. Production
login requires SMS OTP verification. The local/demo bypass is available only
when `AUTH_DEV_PHONE_BYPASS_ENABLED=1` and `NODE_ENV !== "production"`.

Product authorization is still read from Postgres through Drizzle:
`users.role`, `users.status`, and soft-delete state are the source of truth.
Phone numbers are PII and must not be emitted in public DTOs, Open Graph data,
analytics properties, Sentry events, or card verification responses.

Admin routes keep the MFA gate. Until a Supabase-compatible admin MFA policy is
implemented, admin access is denied by the MFA check.

## CSP

Auth flows must allow the configured Supabase project origin for OTP/session
requests. Keep existing Stripe, Turnstile, Sentry, and Plausible allowlists.
