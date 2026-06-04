// BLOCK: Root layout — global HTML wrapper (fonts, metadata, skip link, body). This file defines the top-level <html> and <body> for the app. Do NOT place dev-only UI here.
import './globals.css';

import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Oxanium, Playfair_Display } from 'next/font/google';
import type { ReactNode } from 'react';

import { NetworkStatusToast } from '@/components/ui/network-status-toast';
import { getT } from '@/lib/i18n/t-server';
import { cn } from '@/lib/utils';

const oxanium = Oxanium({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

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
  viewportFit: 'cover',
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
          className="kc-skip-link"
        >
          {tA11y('skipToContent')}
        </a>
        {children}
        <NetworkStatusToast />
      </body>
    </html>
  );
}
