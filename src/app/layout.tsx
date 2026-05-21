import type { ReactNode } from 'react';

import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';

import { getT } from '@/lib/i18n/t-server';

import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
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
    <html lang="en" className={`${plusJakartaSans.variable} ${playfairDisplay.variable}`}>
      <body>
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
