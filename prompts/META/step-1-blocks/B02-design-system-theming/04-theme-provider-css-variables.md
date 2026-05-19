04-theme-provider-css-variables.md
Title
Theme Provider (dark baseline) — CSS variables and toggling skeleton

Objective
Introduce a ThemeProvider to manage theme class on <html>. Default to dark-only now, enable future extensibility.

Steps
Install next-themes and create a Providers wrapper.
Wrap RootLayout with ThemeProvider.
Ensure CSS variables work either way (dark is default).
Commands
bash

copy
pnpm add next-themes
Files to add/modify
src/components/providers/theme-provider.tsx
src/app/layout.tsx (wrap provider)
src/components/providers/theme-provider.tsx
tsx

copy
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
src/app/layout.tsx (patch)
tsx

copy
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
Acceptance
App renders with dark theme by default.
No FOUC; switching themes later will be trivial if needed.
CSS variables unaffected and consistent.