# 01-sentry-setup-frontend-backend.md

## Title

Sentry setup — Next.js frontend + server/edge

## Objective

Instrument client, Node (server actions, API routes), and edge runtime. Wire release + source map upload in CI.

## Steps

1. Install Sentry SDK for Next:

- pnpm add @sentry/nextjs

1. Initialize Sentry via wizard (recommended) or manual config:

- npx @sentry/wizard -i nextjs
- Fill DSN, environment, and sample rates.

1. Create configs:

- sentry.client.config.ts
- sentry.server.config.ts
- sentry.edge.config.ts

1. Wrap next.config.js with withSentryConfig (hide source maps from public).

2. Add env vars:

- SENTRY_DSN
- SENTRY_ENV=development|staging|production
- SENTRY_TRACES_SAMPLE_RATE=0.1 (adjust)
- SENTRY_DEBUG=false (optional)

1. CI: upload source maps on build (wizard can scaffold). Ensure auth token is in CI secrets.

## Files

### sentry.client.config.ts

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
  integrations: [],
  // You can enable replay later if needed
});
```

### sentry.server.config.ts

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
  integrations: [],
});
```

### sentry.edge.config.ts

```ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
});
```

### next.config.js (wrap with Sentry)

```js
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  images: { remotePatterns: [] },
};

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    hideSourcemaps: true,
    widenClientFileUpload: true,
  },
);
```

### Optional: capture in GlobalError (already present)

```ts
// src/app/error.tsx
'use client';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { TryAgain } from '@/components/common/try-again';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (/* ...existing UI... */);
}
```

## CI (example)

- Add SENTRY_AUTH_TOKEN in repo secrets.
- Wizard may create sentry.properties and build steps; otherwise:
  - Upload via @sentry/cli or withSentryConfig defaults.

## CSP note

- If using CSP from B14, add Sentry ingest to connect-src/script-src if needed:
  - <https://oXXXX.ingest.sentry.io> or <https://browser.sentry-cdn.com> (depending on SDK).
  - Example (middleware.ts): add <https://o*.ingest.sentry.io> to connect-src.

## Acceptance

- Throwing an error in dev/staging sends an event to Sentry.
- Source maps available in Sentry (stack traces de-minified).
- DSN/env configurable per environment.
