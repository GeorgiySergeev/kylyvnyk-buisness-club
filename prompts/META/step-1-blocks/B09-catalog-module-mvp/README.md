# B09: Catalog Module Mvp

## Overview

This block outlines the step-by-step instructions for implementing the **Catalog Module Mvp** functionality in the KYLYVNYK CLUB project.

## Steps

1. **[Catalog â€” list PUBLISHED partners (grid + reusable card)](./01-partners-list-published-only.md)**
   Create public Catalog route that lists only PUBLISHED businesses in a responsive grid using a reusable BusinessCard. Prepare for filters/search/pagination.

2. **[Catalog Filters â€” country, city, category (GET form with big gold actions)](./02-filters-countries-cities-categories.md)**
   Add a server-side FilterBar with three selects (All Countries, All Cities, All Categories) and a prominent gold â€œFind partnerâ€ submit. Cities list narrows by selected country.

3. **[Search + Sorting â€” MVP ILIKE (FTS-ready), query schema, and server filtering](./03-search-and-sorting-postgres-fts.md)**
   Wire search (q) and sorting (recent|name). Use simple ILIKE on name/short_description for MVP, with a future FTS note. Validate query via Zod.

4. **[Partner Details â€” PUBLISHED only, special conditions gated after signâ€‘in](./04-partner-details-page.md)**
   Create details page /catalog/[id] showing published business info: logo/monogram, name, category, location, website, short description. If user is signed in, show partner offers (PRIVATE_AFTER_LOGIN); guests see a privacy note.

5. **[Pagination â€” page param + Load More button (preserve filters)](./05-pagination-or-infinite-scroll.md)**
   Implement server pagination with page/pageSize query params and a client-side â€œLoad moreâ€ button that appends the next page while preserving filters.

6. **[Loading & Empty States â€” skeletons, empty message, route-level loading](./06-loading-empty-states.md)**
   Provide user-friendly skeletons and empty states for Catalog list and Details page. Add route-level loading.tsx files.

## Overall Acceptance Criteria

Upon completion of this block:
- All configuration and implementations described in the steps are completed.
- The application runs correctly without errors.
- Code aligns with the project's quality and architectural standards.
