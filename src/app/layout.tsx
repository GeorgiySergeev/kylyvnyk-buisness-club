import type { ReactNode } from 'react';

import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Oxanium, Playfair_Display } from 'next/font/google';

import { getT } from '@/lib/i18n/t-server';
import { cn } from '@/lib/utils';

import './globals.css';

const oxanium = Oxanium({ subsets: ['latin'], variable: '--font-sans' });

const playfairDisplay = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'KYLYVNYK CLUB',
    template: '%s | KYLYVNYK CLUB',
  },
  description: 'Private business club platform',
};

export const viewport: Viewport = {
  colorScheme: 'dark',
  initialScale: 1,
  themeColor: '#0a0a0b',
  width: 'device-width',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const tA11y = getT('a11y');

  return (
    <html
      lang="en"
      className={cn(
        playfairDisplay.variable,
        jetBrainsMono.variable,
        'font-sans overflow-x-hidden',
        oxanium.variable,
      )}
    >
      <body suppressHydrationWarning className="overflow-x-hidden min-h-dvh">
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:outline-2 focus:outline-offset-2 focus:outline-ring"
        >
          {tA11y('skipToContent')}
        </a>
        {children}
      </body>
    </html>
  );
}
