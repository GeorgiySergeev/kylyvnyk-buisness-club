03-typography-base-styles.md
Title
Typography Base — fonts, scale, and prose styles

Objective
Install premium sans-serif font, configure base typographic scale, and add markdown/prose defaults suitable for luxury minimalism.

Steps
Install and wire fonts via next/font.
Add base typography scale and heading weights.
Install @tailwindcss/typography and configure dark prose.
Commands
bash

copy
pnpm add @next/font
pnpm add -D @tailwindcss/typography
Files to add/modify
src/app/fonts.ts
src/app/layout.tsx (use fonts)
tailwind.config.ts (add plugin)
src/styles/typography.css
src/app/fonts.ts
ts

copy
import { Plus_Jakarta_Sans } from 'next/font/google';

export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
});
src/app/layout.tsx (patch)
tsx

copy
import './globals.css';
import '@/styles/typography.css';
import { plusJakarta } from './fonts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${plusJakarta.variable} font-sans bg-bg text-fg`}>
        {children}
      </body>
    </html>
  );
}
tailwind.config.ts (patch)
ts

copy
// ...
theme: {
  // ...
  extend: {
    // ...
    fontFamily: {
      sans: ['var(--font-jakarta)', 'system-ui', 'Segoe UI', 'Inter', 'Arial', 'sans-serif']
    },
  }
},
plugins: [require('@tailwindcss/typography')]
src/styles/typography.css
css

copy
/***** Headings *****/
.h1 { font-size: clamp(2rem, 4.5vw, 3rem); line-height: 1.1; font-weight: 800; letter-spacing: -0.02em; }
.h2 { font-size: clamp(1.6rem, 3.6vw, 2.25rem); line-height: 1.15; font-weight: 700; letter-spacing: -0.01em; }
.h3 { font-size: clamp(1.25rem, 2.6vw, 1.5rem); line-height: 1.2; font-weight: 600; }

/***** Body *****/
.body-lg { font-size: 1.125rem; line-height: 1.6; }
.body { font-size: 1rem; line-height: 1.65; }
.body-sm { font-size: 0.9375rem; line-height: 1.6; color: hsl(var(--fg-muted)); }

/***** Links *****/
a { text-underline-offset: 2px; text-decoration-thickness: 0.08em; }
a:hover { text-decoration-color: hsl(var(--gold)); }

/***** Prose (markdown/content) *****/
.prose {
  --tw-prose-body: hsl(var(--fg));
  --tw-prose-headings: hsl(var(--fg));
  --tw-prose-links: hsl(var(--gold));
  --tw-prose-bold: hsl(var(--fg));
  --tw-prose-quotes: hsl(var(--fg));
  --tw-prose-counters: hsl(var(--fg-muted));
  --tw-prose-bullets: hsl(var(--fg-muted));
  --tw-prose-hr: hsl(var(--border));
  --tw-prose-code: hsl(var(--fg));
  --tw-prose-th-borders: hsl(var(--border));
  --tw-prose-td-borders: hsl(var(--border));
}
.prose :where(code):not(:where(pre code)) {
  background: hsl(var(--bg-elev));
  border: 1px solid hsl(var(--border));
  padding: .15rem .35rem;
  border-radius: 6px;
}
.prose-invert { color: hsl(var(--fg)); }
Acceptance
Headings and body classes render with premium look.
@tailwindcss/typography works; .prose and .prose-invert usable.
Layout uses Plus Jakarta Sans by default.