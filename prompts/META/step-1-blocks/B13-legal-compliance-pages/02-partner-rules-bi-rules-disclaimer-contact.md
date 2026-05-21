# 02-partner-rules-bi-rules-disclaimer-contact.md

## Title

Legal Pages Set 2 — Partner Rules, BI Rules, Disclaimer, Contact Us

## Objective

Add remaining legal/compliance pages. Explicitly prohibit MLM/affiliate/income language in BI Rules. Provide a simple Contact page.

## Steps

1. Add Partner Rules (for business profiles).
2. Add Business Introduction Rules (no MLM, no payouts; admin‑managed).
3. Add general Disclaimer page.
4. Add Contact Us page with email and minimal info.

## Files to add

- src/app/(public)/legal/rules/partner/page.tsx
- src/app/(public)/legal/rules/bi/page.tsx
- src/app/(public)/legal/disclaimer/page.tsx
- src/app/(public)/legal/contact/page.tsx

### src/app/(public)/legal/rules/partner/page.tsx

```tsx
import { LEGAL } from '@/config/legal';

export const metadata = { title: `Partner Rules — ${LEGAL.entityName}` };

export default function PartnerRulesPage() {
  return (
    <>
      <h1>Partner Rules</h1>
      <p>Last updated: {new Date(LEGAL.lastUpdatedISO).toLocaleDateString()}</p>

      <ul>
        <li>Partners must be properly licensed and compliant in relevant jurisdictions.</li>
        <li>Special conditions must be accurate, lawful, and honored to verified members.</li>
        <li>No misleading claims, unlawful incentives, or high‑risk categories.</li>
        <li>{LEGAL.entityName} may request proof of compliance or remove listings at any time.</li>
        <li>
          Partners remain solely responsible for their services, pricing, and legal obligations.
        </li>
      </ul>
    </>
  );
}
```

### src/app/(public)/legal/rules/bi/page.tsx

```tsx
import { LEGAL } from '@/config/legal';

export const metadata = { title: `Business Introduction Rules — ${LEGAL.entityName}` };

export default function BiRulesPage() {
  return (
    <>
      <h1>Business Introduction Rules</h1>
      <p>Last updated: {new Date(LEGAL.lastUpdatedISO).toLocaleDateString()}</p>

      <ul>
        <li>
          Business Introductions are available to VIP members only and processed by the admin team.
        </li>
        <li>
          No commissions, no earnings, no affiliate, no MLM, and no passive income mechanics are
          involved.
        </li>
        <li>
          Limits, ratings, and internal criteria are managed by admins and are not displayed
          publicly.
        </li>
        <li>
          {LEGAL.entityName} does not participate in negotiations or agreements between users and
          partners.
        </li>
      </ul>
    </>
  );
}
```

### src/app/(public)/legal/disclaimer/page.tsx

```tsx
import { LEGAL } from '@/config/legal';

export const metadata = { title: `Disclaimer — ${LEGAL.entityName}` };

export default function DisclaimerPage() {
  return (
    <>
      <h1>Disclaimer</h1>
      <p>Last updated: {new Date(LEGAL.lastUpdatedISO).toLocaleDateString()}</p>

      <p>
        {LEGAL.entityName} provides platform access “as is” and does not guarantee savings, income,
        or business outcomes. Partners are independent and solely responsible for their offers and
        compliance. Nothing on this site constitutes financial, legal, or tax advice. Consult
        qualified advisors.
      </p>
    </>
  );
}
```

### src/app/(public)/legal/contact/page.tsx

```tsx
import { LEGAL } from '@/config/legal';

export const metadata = { title: `Contact Us — ${LEGAL.entityName}` };

export default function ContactPage() {
  return (
    <>
      <h1>Contact Us</h1>
      <p className="mt-2">
        For support and inquiries, email{' '}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
      <p className="mt-2 text-sm text-fgMuted">
        Response times may vary. Please avoid sending sensitive information via email.
      </p>
    </>
  );
}
```

## Acceptance

- 4 pages render and align with compliance language.
- BI Rules explicitly forbid MLM/affiliate/income mechanics.
- Contact page provides a working email and basic instructions.
