# 03-footer-disclaimers-unified.md

## Title

Unified Disclaimers — reusable legal inserts and constants

## Objective

Centralize mandatory phrases and ensure they are reused in footer and relevant pages.

## Steps

1) Add a constants module with required phrases.
2) Expose a LegalInserts component (reuse or update if exists).
3) Use in footer and optionally on landing/legal pages.

## Files to add/modify

- src/features/legal/phrases.ts
- src/features/legal/footer-inserts.tsx (ensure consistent text)

### src/features/legal/phrases.ts

```ts
export const REQUIRED_PHRASES = {
  platform: 'KYLYVNYK CLUB is an independent private membership platform.',
  notEmployerInvestment: 'KYLYVNYK CLUB is not an employer, investment platform, MLM company or guarantee-of-income system.',
  specialConditions: 'Special conditions are provided directly by independent third-party partners.',
  noGuarantees: 'KYLYVNYK CLUB does not guarantee savings, income, commissions, bonuses, clients or business results.',
  partnerResponsibility: 'Partners independently provide their own services and are responsible for their own licenses, permits and compliance.',
  noParticipation: 'KYLYVNYKNYK CLUB does not participate in transactions, negotiations or agreements between users and partners.',
};
```

### src/features/legal/footer-inserts.tsx

```tsx
import { REQUIRED_PHRASES } from './phrases';

export function LegalInserts({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="text-sm text-fgMuted">
        {REQUIRED_PHRASES.platform} {REQUIRED_PHRASES.specialConditions}{' '}
        {REQUIRED_PHRASES.noGuarantees} {REQUIRED_PHRASES.partnerResponsibility}{' '}
        {REQUIRED_PHRASES.noParticipation} {REQUIRED_PHRASES.notEmployerInvestment}
      </p>
    </div>
  );
}
```

Note

- If a previous LegalInserts exists, replace body text with constants above to keep a single source of truth.

## Acceptance

- Footer renders EXACT required phrases via constants.
- Reuse available on landing/legal pages for consistent wording.
