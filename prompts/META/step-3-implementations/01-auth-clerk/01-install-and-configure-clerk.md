# 01-auth-clerk/01-install-and-configure-clerk.md

## Title

Clerk Setup & Provider

## Objective

Установить и настроить базовый провайдер Clerk.

## Files

### src/app/layout.tsx

```tsx
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: '#D4AF37' },
        elements: {
          card: 'bg-zinc-900 border border-zinc-800',
        },
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

## Acceptance
- ClerkProvider обертывает приложение.
- Применена темная тема (соответствие B02).