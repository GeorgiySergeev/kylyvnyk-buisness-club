# B06: Routing Layout Architecture

## Overview

This block outlines the step-by-step instructions for implementing the **Routing Layout Architecture** functionality in the KYLYVNYK CLUB project.

## Steps

1. **[Route Groups Structure â€” public, auth, member, business, admin](./01-route-groups-structure.md)**
   Create and standardize App Router groups for public pages, auth, member/VIP, business tools, and admin. Ensure each group has its own layout shell.

2. **[Root Layout + Metadata + Header/Footer + Mobile Nav](./02-root-layout-head-og-header-footer.md)**
   Set site-wide metadata (title/OG), build header/footer components with mobile-first navigation, and wire them into public layout.

3. **[Role-aware Middleware Redirects (auth UX and canonicalization)](./03-role-based-redirect-middleware.md)**
   Enhance middleware to improve UX: redirect signed-in users away from auth pages, and provide simple canonical redirects. Keep RBAC logic in layouts/guards.

4. **[Error Boundary and Not Found Pages (black & gold)](./04-error-and-not-found-pages.md)**
   Provide branded error and 404 pages with accessible UI and clear navigation options.

5. **[Sitemap and Robots Stubs (App Router)](./05-sitemap-and-robots.md)**
   Expose standard sitemap.xml and robots.txt using Nextâ€™s built-in route handlers. Include key URLs for MVP and leave hooks for dynamic entries later.

## Overall Acceptance Criteria

Upon completion of this block:

- All configuration and implementations described in the steps are completed.
- The application runs correctly without errors.
- Code aligns with the project's quality and architectural standards.
