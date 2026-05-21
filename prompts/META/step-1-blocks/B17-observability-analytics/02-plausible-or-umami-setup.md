# 02-plausible-or-umami-setup.md

## Title

Analytics — Plausible or Umami

## Objective

Add simple, privacy-friendly analytics with minimal JS. Track custom events for VIP CTA, Checkout Start, Verify Card View.

## Steps

1. Choose a provider (example shows Plausible Cloud).
2. Add your domain in Plausible UI.
3. Insert script in <head> of RootLayout.
4. Track custom events from critical UI.

## Files

### src/app/layout.tsx (head insertion)

```tsx
// inside <head> of RootLayout
{
  /* Plausible */
}
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js" />;
```

### Track events

```tsx
// src/components/common/vip-cta-button.tsx (client)
'use client';
export function trackVipClick() {
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible('VIP-CTA-Click');
  }
}
```

Call trackVipClick() inside the VIP CTA onClick handler (before starting checkout).

### Optional: track checkout start (server → client)

- Fire a client event when /api/stripe/checkout succeeds:

```tsx
// After receiving {url} in startCheckout()
(window as any).plausible?.('Checkout-Start');
```

### Track verify-card views (client)

```tsx
// src/app/(public)/verify-card/[number]/page.tsx
// For server page, append a tiny client component to call plausible on mount:
'use client';

import { useEffect } from 'react';

// src/app/(public)/verify-card/[number]/page.tsx
// For server page, append a tiny client component to call plausible on mount:

export function TrackVerifyView() {
  useEffect(() => {
    (window as any).plausible?.('Verify-Card-View');
  }, []);
  return null;
}
```

Mount <TrackVerifyView /> at end of Verify Card page.

## CSP note

- Update CSP (B14) to allow Plausible:
  - script-src add <https://plausible.io>
  - connect-src add <https://plausible.io>
- If self-hosting Umami: replace domain accordingly.

## Acceptance

- Plausible dashboard shows pageviews.
- Events VIP-CTA-Click, Checkout-Start, Verify-Card-View appear with counts.
- CSP allows analytics to load.
