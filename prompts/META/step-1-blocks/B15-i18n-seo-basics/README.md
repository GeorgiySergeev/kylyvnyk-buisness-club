# B15: I18n Seo Basics

## Overview

This block outlines the step-by-step instructions for implementing the **I18n Seo Basics** functionality in the KYLYVNYK CLUB project.

## Steps

1. **[next-intl skeleton â€” single-locale MVP with feature namespaces](./01-next-intl-skeleton-and-namespaces.md)**
   Add a minimal next-intl setup for a single-locale MVP (en) that is easy to extend to multiple locales later. Provide feature-based message namespaces.

2. **[Localize landing slogans, CTAs, and legal inserts](./02-localizable-slogans-cta-legal.md)**
   Replace hardcoded strings in LandingHero, header nav, Catalog page, and LegalInserts with next-intl translations.

3. **[Meta/OG + JSON-LD (Organization, Website)](./03-meta-og-structured-data.md)**
   Add JSON-LD for Organization and Website, align meta/OG with i18n, and expose a reusable SEO component.

4. **[hreflang scaffold â€” alternates metadata, single-locale MVP](./04-hreflang-skeleton.md)**
   Expose alternates.languages metadata for hreflang. Single locale now, easy to extend later.

5. **[Sitemap with i18n scaffold â€” alternates per URL](./05-sitemap-with-i18n-skeleton.md)**
   Update sitemap generation to include alternates.languages for future i18n. Single-locale MVP emits en only.

## Overall Acceptance Criteria

Upon completion of this block:
- All configuration and implementations described in the steps are completed.
- The application runs correctly without errors.
- Code aligns with the project's quality and architectural standards.
