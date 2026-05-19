# B10: Digital Club Card

## Overview

This block outlines the step-by-step instructions for implementing the **Digital Club Card** functionality in the KYLYVNYK CLUB project.

## Steps

1. **[Digital Card â€” number generation + ensure card for member](./01-card-number-generation.md)**
   Generate a unique, humanâ€‘readable card number and ensure every member has a card. Format: TYPE-CC-XXXXXX (e.g., VIP-INTL-000501). Country code is optional in MVP. Notes - TYPE: FREE | VIP (from membership) - CC: 2â€“5 chars uppercase; MVP fallback "INTL" - XXXXXX: zeroâ€‘padded 6â€‘digit pseudoâ€‘random to reduce collisions - Uniqueness: enforced by DB unique(cards.number); retry on conflict

2. **[Digital Card â€” QR code generation and display](./02-qr-code-generation-and-display.md)**
   Render a QR code that encodes a public verification URL: /verify-card/:number. Display in member dashboard with copy helpers.

3. **[Verify Card â€” public page /verify-card/:number (no PII)](./03-verify-card-public-route.md)**
   Create a public route to validate a card by number and show only allowed fields: - memberName - number - status (derived: ACTIVE/EXPIRED/INACTIVE) - memberType (FREE/VIP) - expiresAt No email, phone, payments, or history.

4. **[Digital Card â€” type and status badges](./04-status-and-badges.md)**
   Provide clear, accessible badges for member type and card status. Derive â€œEXPIREDâ€ when expiresAt < now.

5. **[PII Visibility Policy â€” safe mapping for public card data](./05-pii-visibility-policy.md)**
   Guarantee that verify-card returns only allowed fields. Centralize mapping and provide a small public API for JSON responses (optional). Allowed fields on public verification: - memberName - number - status (derived) - memberType - expiresAt Forbidden: - email, phone, payments, history, internal IDs.

6. **[Verification Caching â€” ISR + selective revalidation (optional Redis)](./06-verification-caching.md)**
   Cache public verification responses to reduce DB load, while ensuring timely updates when membership changes.

## Overall Acceptance Criteria

Upon completion of this block:
- All configuration and implementations described in the steps are completed.
- The application runs correctly without errors.
- Code aligns with the project's quality and architectural standards.
