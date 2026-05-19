# 04. Theme Provider & CSS Variables

## Objective

Introduce a `ThemeProvider` that manages the theme class on `<html>`. Default to a dark-only baseline while keeping room for future extensibility.

## Steps

1. Install `next-themes` and create a reusable providers wrapper.
2. Wrap `RootLayout` with the `ThemeProvider`.
3. Ensure CSS variables work regardless of theme (dark by default).

## Command

```bash
pnpm add next-themes
```

## Files to Add or Modify

- `src/components/providers/theme-provider.tsx`
- `src/app/layout.tsx`

### `src/components/providers/theme-provider.tsx`

```tsx
'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
```

### `src/app/layout.tsx`

```tsx
import './globals.css';
import '@/styles/typography.css';
import { plusJakarta } from './fonts';
import { ThemeProvider } from '@/components/providers/theme-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} font-sans bg-bg text-fg`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

## Acceptance Criteria

- [ ] App renders with the dark theme by default.
- [ ] No FOUC appears; future theme switching remains simple.
- [ ] CSS variables stay intact and consistent across themes.