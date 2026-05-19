# B14: Security Hardening

## Overview

This block outlines the step-by-step instructions for implementing the **Security Hardening** functionality in the KYLYVNYK CLUB project.

## Steps

1. **[Cloudflare Turnstile â€” anti-bot on submissions (Business/Introductions)](./01-turnstile-on-forms.md)**
   Add Turnstile CAPTCHA to critical forms (Submit Business, Request Business Introduction). Verify server-side via Turnstile siteverify API.

2. **[Rate Limiting â€” Upstash Redis for API routes and server actions](./02-rate-limiting-upstash.md)**
   Prevent abuse with IP-based rate limits on write endpoints: Submit Business, Introductions, Stripe portal/cancel, and public verification API.

3. **[Security Headers & CSP â€” harden responses; secure cookies](./03-security-headers-csp-cookies.md)**
   Set strict security headers (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), robust CSP for our stack (Next, Clerk, Stripe, Turnstile), and ensure cookies are secure.

4. **[Password Policies â€” delegate to Clerk; client validators for future custom auth](./04-password-policies-or-delegation.md)**
   Use Clerkâ€™s password policy controls for production. Provide reusable validators for potential custom forms (future-safe), without storing passwords in MVP.

5. **[Backups & Secrets â€” DB snapshots, encrypted offsite, and env hygiene](./05-backups-and-secrets.md)**
   Ensure data resilience and secret hygiene: - Automated DB backups/snapshots. - Optional offsite encrypted dumps. - Proper management of environment secrets across environments.

6. **[Compliance Guard â€” block high-risk categories and keywords](./06-high-risk-category-filters.md)**
   Enforce MVP restriction: reject crypto, gambling, adult, firearms, unlicensed finance, highâ€‘risk investments. Validate on submission and on publish.

## Overall Acceptance Criteria

Upon completion of this block:
- All configuration and implementations described in the steps are completed.
- The application runs correctly without errors.
- Code aligns with the project's quality and architectural standards.
