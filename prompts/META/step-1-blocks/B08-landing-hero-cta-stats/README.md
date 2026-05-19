# B08: Landing Hero Cta Stats

## Overview

This block outlines the step-by-step instructions for implementing the **Landing Hero Cta Stats** functionality in the KYLYVNYK CLUB project.

## Steps

1. **[Landing Hero â€” globe visual + premium CTAs (mobileâ€‘first)](./01-hero-with-globe-and-cta.md)**
   Build a mobileâ€‘first hero with a subtle globe/planet visual, premium black & gold look, and 3 primary CTAs: - Become a Member (Free) - VIP Member ($19.99/mo) - Business Partner (from $19.99/mo) Server-aware CTAs: if signedâ€‘in, adapt the primary action.

2. **[Stats block â€” 3 circular metrics (Members, Countries, Partners)](./02-stats-circles-block.md)**
   Add a visually distinct stats block with 3 round counters. Numbers should be real (DB) or approximate; avoid misleading claims.

3. **[Top Partners â€” 3 cards with logo/name/category/location and optional special condition (for signed users)](./03-top-partners-cards.md)**
   Display up to 3 â€œTop Partnersâ€ on the landing, picked by isTopPartner=true and status=PUBLISHED. For guests, do not reveal special conditions; for signedâ€‘in users, show shortText if available. Note: If logos are not yet stored in DB, render monogram avatar.

4. **[Recommended Partners â€” 3 cards without open discounts](./04-recommended-partners-cards.md)**
   Render up to 3 â€œRecommendedâ€ partners on landing (isRecommended=true, status=PUBLISHED). No open discounts â€” always show the private access note.

5. **[Landing assembly â€” compose Hero, Stats, Top Partners, Recommended, and navigation to Catalog/Signâ€‘up](./05-show-more-and-navigation.md)**
   Assemble landing page from B08 components. Ensure mobile spacing, headings hierarchy, and navigation work.

6. **[Legal Inserts â€” required disclaimers on landing/footer](./06-legal-footer-inserts.md)**
   Guarantee required legal phrasing is present and reusable. Add a dedicated component used in footer and optionally on landing. Required phrases: - â€œKYLYVNYK CLUB is an independent private membership platform.â€ - â€œKYLYVNYK CLUB is not an employer, investment platform, MLM company or guarantee-of-income system.â€ - â€œSpecial conditions are provided directly by independent third-party partners.â€ - â€œKYLYVNYK CLUB does not guarantee savings, income, commissions, bonuses, clients or business results.â€ - â€œPartners independently provide their own services and are responsible for their own licenses, permits and compliance.â€ - â€œKYLYVNYK CLUB does not participate in transactions, negotiations or agreements between users and partners.â€

## Overall Acceptance Criteria

Upon completion of this block:
- All configuration and implementations described in the steps are completed.
- The application runs correctly without errors.
- Code aligns with the project's quality and architectural standards.
