# Public Partner Registration Route

**Summary**

Build a public `/{locale}/partner/register` route for new partner/business applications. Home/partner CTAs should send users there instead of `/sign-in` or generic member registration. The flow will be a 4-step form with simple “Step 1 of 4” progress text, Turnstile CAPTCHA on submit, inline accessible errors, and an `Under Review` confirmation state after successful submission.

**Key Changes**

- Add a new public partner-registration feature using the existing Next App Router and local Result-return server-action style:
  - Route: `src/app/[locale]/partner/register/page.tsx`
  - Client form: multi-step, max 2-3 fields per step, no complex stepper.
  - Server action: validates input, verifies Turnstile, rate-limits public submissions, stores application with `status = UNDER_REVIEW`.

- Add a new DB-backed `business_applications` intake table for unauthenticated submissions:
  - Fields: business name, category id, representative name, email, phone, country id, city name, website/social link, two consent booleans, status, optional linked user id, timestamps.
  - Use `business_status` values for `UNDER_REVIEW | PUBLISHED | HIDDEN`.
  - Keep public applicant PII out of public DTOs and directory queries.

- Align business statuses with SPEC:
  - Add `UNDER_REVIEW` to `business_status`.
  - Migrate existing `PENDING` and `DRAFT` business rows to `UNDER_REVIEW`; migrate `DECLINED` to `HIDDEN`.
  - Update app code, admin filters, dashboard labels, admin notifications, seed data, and tests to stop emitting `PENDING`.
  - Do not physically drop old Postgres enum labels in this pass; retire them at the app/schema layer to avoid risky enum surgery.

- Wire CTAs:
  - Partner tier / “Submit Business” CTA goes to `/{locale}/partner/register`.
  - Member/VIP CTAs keep their existing auth/dashboard behavior.
  - Existing authenticated `/m/business/new` can either reuse the new form pattern or redirect VIP users to the public route with known profile fields prefilled when available.

- UX and accessibility:
  - Step 1: Business name, Category select.
  - Step 2: Representative name, Email, Phone.
  - Step 3: Country select, City, Website/Social link.
  - Step 4: Preview, authority consent, terms/privacy consent, Turnstile, Submit.
  - Each field uses `label`, `aria-invalid`, `aria-describedby`, and error text with `role="alert"`.
  - Use existing shadcn/Radix `Select` for category and country, not text inputs.
  - Success view title: `Under Review`; text explains publication appears only after admin review.

- i18n:
  - Add a new `partnerRegistration` namespace across locale files to satisfy parity.
  - Russian copy should preserve the user-provided error messages exactly; English/UK strings should use equivalent localized text.
  - No hard-coded user-facing strings in components/actions.

**Admin Follow-Up**

- Add applications to the admin review queue/counts so admins can see new partner submissions.
- Admin approval creates/publishes a `businesses` row from the application data:
  - Status becomes `PUBLISHED`.
  - If the submitted city does not exist for the selected country, create it during approval.
  - Reuse existing slug generation and audit logging.
- Admin hide/reject action sets the application to `HIDDEN`.

**Test Plan**

- Unit tests:
  - Partner-registration schema happy path.
  - Missing/invalid fields for each required error.
  - Consent failures.
  - Status mapping helper: `PENDING/DRAFT -> UNDER_REVIEW`, `DECLINED -> HIDDEN`.

- Integration/action tests:
  - Valid public submission stores `UNDER_REVIEW`.
  - Missing/failed Turnstile returns typed error.
  - Rate-limit failure returns typed error.
  - Duplicate/rapid submission behavior is handled predictably.

- E2E/regression:
  - Public route renders without auth.
  - Step navigation works on mobile and desktop.
  - Inline errors are announced and connected by `aria-describedby`.
  - Successful submit shows `Under Review`, not generic success.
  - Partner CTA no longer goes to sign-in.

- Final validation:
  - `pnpm lint`
  - `pnpm vocab:check`
  - `pnpm env:check`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`

**Assumptions**

- The route is public and unauthenticated by default, per selected flow.
- `business_applications` is the intake source; `businesses` remains the published/moderated directory source.
- Physical removal of old Postgres enum labels is deferred; app code will only expose `UNDER_REVIEW`, `PUBLISHED`, and `HIDDEN`.
- `docs/new-partner-reg.md` is not currently present in the workspace; implementation should follow the user prompt plus `SPEC.md`/`DESIGN.md`.
