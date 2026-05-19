# 06-legal-footer-inserts.md

## Title

Legal Inserts — required disclaimers on landing/footer

## Objective

Guarantee required legal phrasing is present and reusable. Add a dedicated component used in footer and optionally on landing.

Required phrases:

- “KYLYVNYK CLUB is an independent private membership platform.”
- “KYLYVNYK CLUB is not an employer, investment platform, MLM company or guarantee-of-income system.”
- “Special conditions are provided directly by independent third-party partners.”
- “KYLYVNYK CLUB does not guarantee savings, income, commissions, bonuses, clients or business results.”
- “Partners independently provide their own services and are responsible for their own licenses, permits and compliance.”
- “KYLYVNYK CLUB does not participate in transactions, negotiations or agreements between users and partners.”

## Steps

1) Create a reusable LegalInserts component.
2) Ensure SiteFooter uses this component (B06 step already has text — refactor to reuse).
3) Optionally include a short inline note on landing sections when appropriate.

## Files to add/modify

- src/features/legal/footer-inserts.tsx
- src/components/layout/site-footer.tsx (swap hardcoded block to component)

### src/features/legal/footer-inserts.tsx

```tsx
export function LegalInserts({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-sm text-fgMuted">
        KYLYVNYK CLUB is an independent private membership platform. Special conditions are provided
        directly by independent third-party partners. KYLYVNYK CLUB does not guarantee savings,
        income, commissions, bonuses, clients or business results. Partners independently provide
        their own services and are responsible for their own licenses, permits and compliance.
        KYLYVNYK CLUB does not participate in transactions, negotiations or agreements between users
        and partners. KYLYVNYK CLUB is not an employer, investment platform, MLM company or
        guarantee-of-income system.
      </p>
    </div>
  );
}
```

### src/components/layout/site-footer.tsx (patch)

```tsx
import { LegalInserts } from '@/features/legal/footer-inserts';

export function SiteFooter() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="container py-10 text-sm">
        <div className="grid gap-6 md:grid-cols-2">
          <LegalInserts />
          <ul className="space-y-2">
            <li><a className="hover:text-gold-400" href="/legal/terms">Terms of Use</a></li>
            <li><a className="hover:text-gold-400" href="/legal/privacy">Privacy Policy</a></li>
            <li><a className="hover:text-gold-400" href="/legal/cookie">Cookie Policy</a></li>
            <li><a className="hover:text-gold-400" href="/legal/refund">Refund Policy</a></li>
            <li><a className="hover:text-gold-400" href="/legal/rules/club">Club Rules</a></li>
            <li><a className="hover:text-gold-400" href="/contact">Contact Us</a></li>
          </ul>
        </div>
        <div className="mt-6 text-fgMuted">© {new Date().getFullYear()} KYLYVNYK CLUB</div>
      </div>
    </footer>
  );
}
```

## Acceptance

- Footer shows the exact required legal phrasing via reusable component.
- Text is readable (contrast AA) and concise on mobile.
- No MLM/affiliate/income claims are present anywhere on landing.

—
