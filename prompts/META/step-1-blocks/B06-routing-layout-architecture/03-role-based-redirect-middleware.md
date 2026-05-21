# 03-role-based-redirect-middleware.md

## Title

Role-aware Middleware Redirects (auth UX and canonicalization)

## Objective

Enhance middleware to improve UX: redirect signed-in users away from auth pages, and provide simple canonical redirects. Keep RBAC logic in layouts/guards.

## Steps

1. Extend existing Clerk authMiddleware with afterAuth to redirect from auth routes if already signed-in.
2. Add simple canonical redirect for trailing slashes.
3. Do not add DB-based role checks here (handled by guards).

## Files to modify

- middleware.ts (patch)

### middleware.ts (patch)

```ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/tokens',
    '/catalog(.*)',
    '/verify-card(.*)',
    '/api/public(.*)',
    '/legal(.*)',
    '/favicon.ico',
    '/sitemap.xml',
    '/robots.txt',
  ],
  // Redirect signed-in users off auth pages
  afterAuth(auth, req) {
    const url = new URL(req.nextUrl);
    const isAuthPage = url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up');

    if (auth.userId && isAuthPage) {
      url.pathname = '/member';
      return Response.redirect(url);
    }

    // Canonicalize trailing slash (remove) for non-root
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.replace(/\/+$/, '');
      return Response.redirect(url, 308);
    }

    return;
  },
  ignoredRoutes: ['/api/webhooks(.*)'],
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets/).*)'],
};
```

## Acceptance

- Signed-in users visiting /sign-in or /sign-up are redirected to /member.
- URLs with trailing slash redirect to slashless canonical path.
- No RBAC enforcement done here (left to guards).
