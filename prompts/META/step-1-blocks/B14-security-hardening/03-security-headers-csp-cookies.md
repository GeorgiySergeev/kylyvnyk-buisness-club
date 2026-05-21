# 03-security-headers-csp-cookies.md

## Title

Security Headers & CSP — harden responses; secure cookies

## Objective

Set strict security headers (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), robust CSP for our stack (Next, Clerk, Stripe, Turnstile), and ensure cookies are secure.

## Steps

1. Extend middleware.ts afterAuth to set headers on every response.
2. Provide a CSP that allows required third parties.
3. Confirm cookies are Secure+HttpOnly+SameSite where applicable (ours minimal; Clerk handles its cookies).

## Files to modify

- middleware.ts

### middleware.ts (patch set headers + CSP)

```ts
import { authMiddleware } from '@clerk/nextjs';

function setSecurityHeaders(res: Response) {
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "object-src 'none'",
    "style-src 'self' 'unsafe-inline'", // Next/Tailwind need inline styles in SSR/hydration
    // Allow Next/Clerk/Stripe/Turnstile scripts
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://js.stripe.com https://va.vercel-scripts.com https://clerk.com https://*.clerk.com",
    // API/WS connections
    "connect-src 'self' https: wss: https://*.clerk.com https://api.clerk.com https://api.stripe.com",
    // Embeds/iframes
    'frame-src https://js.stripe.com https://hooks.stripe.com https://challenges.cloudflare.com',
    // Form destinations
    "form-action 'self' https://checkout.stripe.com",
  ].join('; ');

  const headers = new Headers(res.headers);
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'no-referrer');
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  headers.set('Content-Security-Policy', csp);

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

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
  ignoredRoutes: ['/api/webhooks(.*)'],
  afterAuth(auth, req) {
    const url = new URL(req.nextUrl);
    const isAuthPage = url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up');

    if (auth.userId && isAuthPage) {
      url.pathname = '/member';
      return setSecurityHeaders(Response.redirect(url));
    }

    // canonical trailing slash
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.replace(/\/+$/, '');
      return setSecurityHeaders(Response.redirect(url, 308));
    }

    const res = Response.next();
    return setSecurityHeaders(res);
  },
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets/).*)'],
};
```

Notes

- Update CSP when adding new external origins (analytics, images, etc.).
- Cookies: our custom cookies (if any) must be set with Secure, HttpOnly, SameSite=Lax. Clerk-managed cookies already follow best practices.

## Acceptance

- All responses include HSTS, X-CTO, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP.
- Stripe Checkout/Portal and Turnstile function under CSP.
- No mixed content; frames are restricted; no inline event handlers beyond allowed.
