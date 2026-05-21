# 02-feedback-and-overlays.md

## Title

Feedback & Overlays — toast, alert, dialog, sheet

## Objective

Add non-blocking feedback (toast), inline alerts, and overlay components (Dialog, Sheet) aligned with black & gold theme.

## Steps

1. Install and wire shadcn toast utilities.
2. Create Alert variants (info/success/warning/destructive).
3. Ensure Dialog and Sheet are available via shadcn/ui.
4. Add Toaster to RootLayout.

## Commands

```bash
pnpm dlx shadcn@latest add toast dialog sheet
```

## Files to add/modify

- src/components/ui/alert.tsx
- src/app/layout.tsx (mount Toaster)
- Usage example (optional snippet below)

### src/components/ui/alert.tsx

```tsx
import { Icon } from '@/components/icons/icon';
import { cn } from '@/lib/utils/cn';

type Variant = 'info' | 'success' | 'warning' | 'destructive';

const STYLES: Record<Variant, string> = {
  info: 'border-border',
  success: 'border-border',
  warning: 'border-border',
  destructive: 'border-destructive text-destructive',
};

const ICONS: Record<Variant, any> = {
  info: 'Info',
  success: 'CheckCircle2',
  warning: 'AlertTriangle',
  destructive: 'OctagonAlert',
};

export function Alert({
  title,
  description,
  variant = 'info',
  className,
}: {
  title?: string;
  description?: string;
  variant?: Variant;
  className?: string;
}) {
  const IconName = ICONS[variant] as any;
  return (
    <div
      role="status"
      className={cn('rounded-md border p-4 bg-card shadow-soft', STYLES[variant], className)}
    >
      <div className="flex gap-3">
        <span className="mt-0.5 text-gold-500">
          <Icon name={IconName} />
        </span>
        <div className="space-y-1">
          {title && <div className="font-medium">{title}</div>}
          {description && <div className="text-sm text-fgMuted">{description}</div>}
        </div>
      </div>
    </div>
  );
}
```

### src/app/layout.tsx (append Toaster)

```tsx
import { Toaster } from '@/components/ui/toaster';

// ...
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${plusJakarta.variable} font-sans bg-bg text-fg`}>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### Usage examples (optional)

Toast:

```tsx
'use client';

import { useToast } from '@/components/ui/use-toast';

export function DemoToast() {
  const { toast } = useToast();
  return (
    <button
      onClick={() => toast({ title: 'Saved', description: 'Changes applied successfully.' })}
      className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold"
    >
      Show toast
    </button>
  );
}
```

Dialog:

```tsx
'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function DemoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold">
          Open dialog
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Confirm action</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-fgMuted">Please confirm to proceed.</p>
      </DialogContent>
    </Dialog>
  );
}
```

Sheet:

```tsx
'use client';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function DemoSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="px-4 py-2 rounded-md border border-border hover:bg-bgElev focus-gold">
          Open sheet
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-card border-border">
        <div className="p-4">Sheet content</div>
      </SheetContent>
    </Sheet>
  );
}
```

## Acceptance

- Toaster mounted globally; useToast works.
- Alert variants render with appropriate icons.
- Dialog and Sheet open/close with correct focus management and contrast.
