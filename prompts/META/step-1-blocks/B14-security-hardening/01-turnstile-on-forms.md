# 01-turnstile-on-forms.md

## Title

Cloudflare Turnstile — anti-bot on submissions (Business/Introductions)

## Objective

Add Turnstile CAPTCHA to critical forms (Submit Business, Request Business Introduction). Verify server-side via Turnstile siteverify API.

## Steps

1. Add Turnstile widget component and loader script.
2. Add server verification utility.
3. Embed widget in forms and verify token in server actions.

## Prereqs

- Env keys from .env: NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY

## Commands

No new packages required (native script usage).

## Files to add/modify

- src/lib/captcha/turnstile.ts
- src/components/captcha/turnstile-widget.tsx
- Patch forms:
  - src/app/(business)/submit/page.tsx
  - src/app/(member)/vip/introduction/page.tsx
- Patch actions:
  - src/features/business/server/actions.ts
  - src/features/introductions/server/actions.ts

### src/lib/captcha/turnstile.ts

```ts
import 'server-only';

export async function verifyTurnstile(token: string | null | undefined, ip?: string | null) {
  if (!process.env.TURNSTILE_SECRET_KEY) return false;
  if (!token) return false;

  const form = new URLSearchParams();
  form.append('secret', process.env.TURNSTILE_SECRET_KEY);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
  return Boolean(data.success);
}
```

### src/components/captcha/turnstile-widget.tsx

```tsx
'use client';

import { useEffect, useId, useRef } from 'react';

declare global {
  interface Window {
    onTurnstileLoad?: () => void;
    turnstile?: {
      render: (el: HTMLElement, opts: any) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({
  siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
  theme = 'dark',
  inputName = 'cf_turnstile_token',
}: {
  siteKey?: string;
  theme?: 'auto' | 'light' | 'dark';
  inputName?: string;
}) {
  const id = useId();
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    function render() {
      if (!window.turnstile || !widgetRef.current) return;
      widgetIdRef.current = window.turnstile.render(widgetRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token: string) => {
          if (inputRef.current) inputRef.current.value = token;
        },
      });
    }

    // Load script once
    const existing = document.querySelector('script[data-turnstile]');
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
      s.async = true;
      s.defer = true;
      s.setAttribute('data-turnstile', '1');
      window.onTurnstileLoad = render;
      document.head.appendChild(s);
    } else {
      render();
    }

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
      }
    };
  }, [siteKey, theme]);

  return (
    <div className="space-y-2">
      <div ref={widgetRef} id={`cf-turnstile-${id}`} className="cf-turnstile" />
      <input ref={inputRef} type="hidden" name={inputName} />
    </div>
  );
}
```

### Patch Submit Business form (embed widget)

src/app/(business)/submit/page.tsx (inside form, above submit button)

```tsx
import { TurnstileWidget } from '@/components/captcha/turnstile-widget';

// ...
<form action={submitBusiness} className="mt-6 grid gap-4 max-w-2xl">
  {/* ...existing fields... */}
  <TurnstileWidget />
  <button className="gold-gradient text-fgOnGold rounded-md px-6 py-3 shadow-cta focus-gold">
    Submit for review
  </button>
</form>;
```

### Patch Introduction form (embed widget)

src/app/(member)/vip/introduction/page.tsx (inside form, above submit)

```tsx
import { TurnstileWidget } from '@/components/captcha/turnstile-widget';

// ...
<form action={submitIntroduction} className="mt-6 max-w-lg space-y-4">
  {/* ...existing fields... */}
  <TurnstileWidget />
  <button className="gold-gradient text-fgOnGold rounded-md px-6 py-3 shadow-cta focus-gold">
    Submit request
  </button>
</form>;
```

### Verify token in server actions

src/features/business/server/actions.ts (top)

```ts
import { headers } from 'next/headers';

import { verifyTurnstile } from '@/lib/captcha/turnstile';
```

Inside submitBusiness() before validation/insert:

```ts
const ip = headers().get('x-forwarded-for')?.split(',')[0]?.trim() || null;
const token = String(input['cf_turnstile_token'] || '');
const ok = await verifyTurnstile(token, ip);
if (!ok) return { ok: false, error: 'CAPTCHA_FAILED' };
```

src/features/introductions/server/actions.ts (similar)

```ts
import { headers } from 'next/headers';
import { verifyTurnstile } from '@/lib/captcha/turnstile';

// ...
const ip = headers().get('x-forwarded-for')?.split(',')[0]?.trim() || null;
const token = String(input['cf_turnstile_token'] || '');
const ok = await verifyTurnstile(token, ip);
if (!ok) return { ok: false, error: 'CAPTCHA_FAILED' };
```

## Acceptance

- Turnstile widget renders on Submit Business and Introduction forms.
- Server actions reject when token missing/invalid.
- No Turnstile on Clerk-hosted auth pages (Clerk provides own bot defenses).
