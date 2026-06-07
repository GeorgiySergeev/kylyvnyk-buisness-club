# Security Notes

## Authentication

KCLUB uses Supabase Auth for phone-first member authentication. Production
login requires SMS OTP verification. The local/demo bypass is available only
when `AUTH_DEV_PHONE_BYPASS_ENABLED=1` and `NODE_ENV !== "production"`.

Product authorization is still read from Postgres through Drizzle:
`users.role`, `users.status`, and soft-delete state are the source of truth.
Phone numbers are PII and must not be emitted in public DTOs, Open Graph data,
analytics properties, Sentry events, or card verification responses.

Admin routes keep the MFA gate. Production admin access requires a Supabase
Auth session with authenticator assurance level `aal2`, obtained through the
self-service TOTP setup and verification flow at `/{locale}/m/2fa-required`.

## CSP

Auth flows must allow the configured Supabase project origin for OTP/session
requests. Keep existing Stripe, Turnstile, Sentry, and Plausible allowlists.

## HTTP response headers

The shared Next.js header contract currently sets:

- `Content-Security-Policy`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy` denying camera, microphone, and geolocation

`pnpm test:e2e:regression` includes a public-route security-header check.

## Observability PII

Sentry events pass through `scrubSentryEvent`, which filters sensitive headers,
removes user email/IP fields, and redacts emails in error messages. The contract
is covered by `tests/contract/observability/sentry-scrubber.test.ts`.

Plausible remains analytics-only and must not receive custom props containing
PII such as user IDs, emails, phone numbers, card numbers, or IP addresses.
