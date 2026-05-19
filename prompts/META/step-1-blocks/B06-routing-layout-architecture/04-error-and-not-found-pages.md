# 04-error-and-not-found-pages.md

## Title

Error Boundary and Not Found Pages (black & gold)

## Objective

Provide branded error and 404 pages with accessible UI and clear navigation options.

## Steps

1) Add global error.tsx and not-found.tsx under app/.
2) Add a simple “Try again” client component for error boundary.
3) Ensure consistent styling with design tokens.

## Files to add

- src/app/error.tsx
- src/app/not-found.tsx
- src/components/common/try-again.tsx

### src/app/error.tsx

```tsx
'use client';

import { useEffect } from 'react';
import { TryAgain } from '@/components/common/try-again';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Optionally send to Sentry here if integrated
    // captureException(error)
  }, [error]);

  return (
    <html>
      <body className="bg-bg text-fg">
        <main className="container py-20">
          <h1 className="h2">Something went wrong</h1>
          <p className="mt-2 body-sm text-fgMuted">{error?.message || 'Unexpected error.'}</p>
          <div className="mt-6">
            <TryAgain onClick={() => reset()} />
          </div>
        </main>
      </body>
    </html>
  );
}
```

### src/app/not-found.tsx

```tsx
export default function NotFound() {
  return (
    <main className="container py-20">
      <h1 className="h2">Page not found</h1>
      <p className="mt-2 body-sm text-fgMuted">The page you’re looking for doesn’t exist.</p>
      <a href="/" className="mt-6 inline-block px-5 py-3 rounded-md border border-border hover:bg-bgElev focus-gold">
        Go back home
      </a>
    </main>
  );
}
```

### src/components/common/try-again.tsx

```tsx
'use client';

export function TryAgain({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-3 rounded-md border border-border hover:bg-bgElev focus-gold"
    >
      Try again
    </button>
  );
}
```

## Acceptance

- Throwing in any server component triggers GlobalError with reset.
- Visiting an unknown route shows NotFound with link home.
- Styling matches black & gold theme.
