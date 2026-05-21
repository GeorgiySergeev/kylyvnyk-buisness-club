# 01-terms-privacy-cookie-refund-club-rules.md

## Title

Legal Pages Set 1 — Terms, Privacy, Cookie, Refund, Club Rules

## Objective

Create public legal pages with required clauses and safe defaults. Centralize brand/jurisdiction in config. Use semantic headings and anchors for SEO and readability.

## Steps

1. Add legal config (brand, governing law, arbitration basics, contact email).
2. Add a basic LegalLayout with consistent spacing.
3. Add 5 pages: Terms, Privacy, Cookie, Refund, Club Rules.
4. Include required phrases and arbitration/limitation clauses in Terms and Refund.

## Files to add/modify

- src/config/legal.ts
- src/app/(public)/legal/layout.tsx
- src/app/(public)/legal/terms/page.tsx
- src/app/(public)/legal/privacy/page.tsx
- src/app/(public)/legal/cookie/page.tsx
- src/app/(public)/legal/refund/page.tsx
- src/app/(public)/legal/rules/club/page.tsx

### src/config/legal.ts

```ts
export const LEGAL = {
  entityName: 'KYLYVNYK CLUB',
  entityDescription: 'independent private membership platform',
  governingLaw: 'State of Delaware, USA', // TODO: confirm with legal counsel
  arbitrationProvider: 'American Arbitration Association (AAA)', // placeholder
  contactEmail: 'support@kylyvnyk.club',
  contactUrl: '/contact',
  lastUpdatedISO: '2026-05-18', // update on edits
};
```

### src/app/(public)/legal/layout.tsx

```tsx
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container py-10">
      <div className="mx-auto max-w-3xl prose prose-invert">{children}</div>
    </main>
  );
}
```

### src/app/(public)/legal/terms/page.tsx

```tsx
import { LEGAL } from '@/config/legal';

export const metadata = { title: `Terms of Use — ${LEGAL.entityName}` };

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Use</h1>
      <p>Last updated: {new Date(LEGAL.lastUpdatedISO).toLocaleDateString()}</p>

      <h2>1. About {LEGAL.entityName}</h2>
      <p>
        {LEGAL.entityName} is an {LEGAL.entityDescription}. Special conditions are provided directly
        by independent third‑party partners. {LEGAL.entityName} does not guarantee savings, income,
        commissions, bonuses, clients or business results. Partners are responsible for their own
        licenses, permits and compliance. {LEGAL.entityName} does not participate in transactions,
        negotiations or agreements between users and partners.
      </p>

      <h2>2. Eligibility and Accounts</h2>
      <ul>
        <li>You must provide accurate information and keep your account secure.</li>
        <li>We may suspend or terminate access for violations or legal/safety reasons.</li>
      </ul>

      <h2>3. Membership</h2>
      <ul>
        <li>FREE members receive a digital club card and catalog access.</li>
        <li>
          VIP membership is subscription‑based. Cancellation takes effect at the end of the current
          period.
        </li>
        <li>
          High‑risk categories are not permitted (crypto, gambling, adult, firearms, unlicensed
          finance, high‑risk investments).
        </li>
      </ul>

      <h2>4. Business Profiles and Introductions</h2>
      <ul>
        <li>
          Business publication requires review and may be hidden or removed at any time for policy
          or legal reasons.
        </li>
        <li>
          Business Introductions are VIP‑only and processed manually by the club team. No
          commissions, bonuses or MLM mechanics.
        </li>
      </ul>

      <h2>5. Intellectual Property</h2>
      <p>
        Content and trademarks belong to their respective owners. Do not copy, resell, or misuse
        platform materials.
      </p>

      <h2>6. Acceptable Use</h2>
      <p>
        No unlawful, fraudulent, misleading, or harmful activities. No scraping, reverse
        engineering, or security violations.
      </p>

      <h2>7. Disclaimers</h2>
      <p>
        {LEGAL.entityName} provides the platform “as is” without warranties of any kind, including
        implied warranties of merchantability, fitness for a particular purpose, and
        non‑infringement.
      </p>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, {LEGAL.entityName} and its affiliates are not liable
        for indirect, incidental, special, consequential, exemplary, or punitive damages, or any
        loss of profits, revenues, data, or goodwill, arising from or related to your use of the
        platform or interactions with partners.
      </p>

      <h2>9. Governing Law; Arbitration; Waiver of Class Actions</h2>
      <p>
        These Terms are governed by the laws of the {LEGAL.governingLaw}, without regard to
        conflicts of laws rules.
      </p>
      <p>
        Any dispute will be resolved by binding individual arbitration administered by the{' '}
        {LEGAL.arbitrationProvider}. You and {LEGAL.entityName} waive any right to a jury trial or
        to participate in a class action.
      </p>

      <h2>10. Modifications</h2>
      <p>
        We may update these Terms. Material changes will be posted with a new “Last updated” date.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> or visit{' '}
        <a href={LEGAL.contactUrl}>Contact</a>.
      </p>
    </>
  );
}
```

### src/app/(public)/legal/privacy/page.tsx

```tsx
import { LEGAL } from '@/config/legal';

export const metadata = { title: `Privacy Policy — ${LEGAL.entityName}` };

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date(LEGAL.lastUpdatedISO).toLocaleDateString()}</p>

      <h2>1. Overview</h2>
      <p>
        We collect minimal personal data required to provide membership features (e.g., email and
        password for registration; optional phone for verification). We do not collect ID/passport,
        date of birth, address, bank or tax documents in MVP.
      </p>

      <h2>2. Data We Collect</h2>
      <ul>
        <li>Account data: email, password (hashed), optional phone.</li>
        <li>Membership and subscription metadata (status, validity dates).</li>
        <li>Business profile data you submit for review.</li>
        <li>Technical data: logs, device/browser info, cookies as described in Cookie Policy.</li>
      </ul>

      <h2>3. How We Use Data</h2>
      <ul>
        <li>To provide account access, digital card, and catalog features.</li>
        <li>To process subscriptions and provide receipts via Stripe.</li>
        <li>To moderate submitted business profiles and ensure compliance.</li>
        <li>To protect our services (security, fraud prevention, abuse detection).</li>
      </ul>

      <h2>4. Sharing</h2>
      <ul>
        <li>Service providers (e.g., hosting, email, payments) under appropriate agreements.</li>
        <li>Legal requests or compliance with applicable law.</li>
        <li>We do not sell personal data.</li>
      </ul>

      <h2>5. Security</h2>
      <p>
        We use HTTPS, password hashing, email verification, admin 2FA, and backups. No method is
        100% secure.
      </p>

      <h2>6. Your Rights</h2>
      <p>
        Depending on your jurisdiction, you may access, correct, or delete certain data. Contact us
        at {LEGAL.contactEmail}.
      </p>

      <h2>7. International Transfers</h2>
      <p>Data may be processed in the United States or other locations of our service providers.</p>

      <h2>8. Changes</h2>
      <p>
        We may update this policy. Material changes will be posted with a new “Last updated” date.
      </p>

      <h2>9. Contact</h2>
      <p>
        Email <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </>
  );
}
```

### src/app/(public)/legal/cookie/page.tsx

```tsx
import { LEGAL } from '@/config/legal';

export const metadata = { title: `Cookie Policy — ${LEGAL.entityName}` };

export default function CookiePage() {
  return (
    <>
      <h1>Cookie Policy</h1>
      <p>Last updated: {new Date(LEGAL.lastUpdatedISO).toLocaleDateString()}</p>

      <h2>1. What Are Cookies</h2>
      <p>Small text files to recognize your device and improve functionality.</p>

      <h2>2. Types We Use</h2>
      <ul>
        <li>Essential cookies (authentication, security, load balancing).</li>
        <li>Preference cookies (remembering choices).</li>
        <li>Analytics (privacy‑friendly, aggregated; no sale of personal data).</li>
      </ul>

      <h2>3. Managing Cookies</h2>
      <p>You can control cookies via browser settings. Disabling some may impact features.</p>

      <h2>4. Contact</h2>
      <p>
        Email <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
    </>
  );
}
```

### src/app/(public)/legal/refund/page.tsx

```tsx
import { LEGAL } from '@/config/legal';

export const metadata = { title: `Refund Policy — ${LEGAL.entityName}` };

export default function RefundPage() {
  return (
    <>
      <h1>Refund Policy</h1>
      <p>Last updated: {new Date(LEGAL.lastUpdatedISO).toLocaleDateString()}</p>

      <h2>1. Subscriptions</h2>
      <p>
        Subscription fees are non‑refundable except where required by law. Cancellation takes effect
        at the end of the current billing period.
      </p>

      <h2>2. Billing Support</h2>
      <p>
        For billing questions or errors, contact us at{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>

      <h2>3. Chargebacks</h2>
      <p>Please contact support before disputing a charge so we can help resolve issues quickly.</p>
    </>
  );
}
```

### src/app/(public)/legal/rules/club/page.tsx

```tsx
import { LEGAL } from '@/config/legal';

export const metadata = { title: `Club Rules — ${LEGAL.entityName}` };

export default function ClubRulesPage() {
  return (
    <>
      <h1>Club Rules</h1>
      <p>Last updated: {new Date(LEGAL.lastUpdatedISO).toLocaleDateString()}</p>

      <ul>
        <li>Be respectful and lawful. No harassment, hate, or illegal content.</li>
        <li>No promises of income, commissions, or bonuses. No MLM or affiliate mechanics.</li>
        <li>Only verified and compliant partners are listed.</li>
        <li>
          High‑risk categories are prohibited (crypto, gambling, adult, firearms, unlicensed
          finance, high‑risk investments).
        </li>
        <li>Violations may result in removal or blocking at our discretion.</li>
      </ul>
    </>
  );
}
```

## Acceptance

- 5 legal pages render under /legal/\* with black & gold styling via LegalLayout.
- Terms include required disclaimers, arbitration, class action waiver, limitation of liability/damages.
- Refund page includes “non‑refundable except where required by law”.
