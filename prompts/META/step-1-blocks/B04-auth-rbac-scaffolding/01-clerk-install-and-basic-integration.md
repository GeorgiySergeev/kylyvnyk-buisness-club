# 01-clerk-install-and-basic-integration.md

## Title

Clerk install and base integration (Next.js App Router)

## Objective

Install Clerk, wrap the app with ClerkProvider, and wire base middleware for auth-aware routing.

## Prereqs

- .env contains NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY (see B02).
- Next.js App Router (src/app).

## Steps

1) Install @clerk/nextjs.
2) Wrap RootLayout with ClerkProvider.
3) Add middleware.ts with Clerk authMiddleware and public routes.
4) Add basic Clerk UI mounting check (no runtime errors).

## Commands

```bash
pnpm add @clerk/nextjs
```

## Files to add/modify

- src/app/layout.tsx (wrap with ClerkProvider)
- middleware.ts (Clerk authMiddleware)

### src/app/layout.tsx (patch)

```tsx
import './globals.css';
import '@/styles/typography.css';
import { ClerkProvider } from '@clerk/nextjs';
import { plusJakarta } from './fonts';
import { ThemeProvider } from '@/components/providers/theme-provider';

export const metadata = {
  title: 'KYLYVNYK CLUB',
  description: 'International private membership platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${plusJakarta.variable} font-sans bg-bg text-fg`}>
          <ThemeProvider>{children}</ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### middleware.ts

```ts
import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Public pages (no auth required)
  publicRoutes: [
    '/',                 // landing
    '/tokens',           // design tokens preview (dev only - remove in prod)
    '/catalog(.*)',      // public catalog list/details (offers gated in UI)
    '/verify-card(.*)',  // public card verification
    '/api/public(.*)',   // any public APIs
    '/legal(.*)',        // legal pages
    '/favicon.ico',
    '/sitemap.xml',
    '/robots.txt',
  ],
  // Allow Clerk to handle auth pages internally
  ignoredRoutes: ['/api/webhooks(.*)'],
});

export const config = {
  matcher: [
    // Skip static files and _next
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets/).*)',
  ],
};
```

## Acceptance

- App builds and renders with ClerkProvider.
- Visiting public routes works without sign-in.
- No runtime errors from Clerk on dev server.
