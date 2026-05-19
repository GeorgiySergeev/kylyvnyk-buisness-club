01-tailwind-design-tokens.md
Title
Tailwind Design Tokens — black & gold premium theme

Objective
Define semantic CSS variables and Tailwind tokens for a luxury black & gold, mobile-first UI. Prepare foundation for accessible contrast and consistent components.

Steps
Extend CSS variables in globals.css with semantic tokens (backgrounds, text, borders, gold scale, shadows).
Extend Tailwind theme with semantic colors, shadows, radii.
Add utility classes for gold gradient accents and focus rings.
Files to modify/create
src/app/globals.css
tailwind.config.ts
src/app/globals.css (patch/append)
css

copy
:root {
  /* Base surfaces (dark-only baseline) */
  --bg: 0 0% 4%;
  --bg-elev: 0 0% 7%;
  --card: 0 0% 8%;
  --overlay: 0 0% 0% / 0.6;

  /* Text */
  --fg: 0 0% 96%;
  --fg-muted: 0 0% 70%;
  --fg-on-gold: 0 0% 8%;

  /* Borders & rings */
  --border: 0 0% 18%;
  --ring: 46 85% 55%;

  /* Gold scale (fine-tuned for contrast on dark) */
  --gold-900: 46 90% 42%;
  --gold-800: 46 88% 48%;
  --gold-700: 46 86% 52%;
  --gold:     46 85% 55%;
  --gold-500: 46 82% 60%;
  --gold-400: 46 80% 65%;

  /* States */
  --success: 142 70% 45%;
  --warning: 35 92% 55%;
  --destructive: 0 84% 63%;

  /* Radii */
  --radius-lg: 16px;
  --radius-md: 12px;
  --radius-sm: 8px;

  /* Shadows (premium soft + subtle gold outline) */
  --shadow-soft: 0 6px 28px rgba(0,0,0,0.35), 0 0 0 1px hsla(46,85%,55%,0.06);
  --shadow-cta: 0 10px 36px rgba(0,0,0,0.45), 0 0 0 1px hsla(46,85%,55%,0.12);
}

/* Helpers */
.gold-gradient {
  background-image: linear-gradient(135deg,
    hsl(var(--gold-900)) 0%,
    hsl(var(--gold-800)) 25%,
    hsl(var(--gold-700)) 50%,
    hsl(var(--gold)) 75%,
    hsl(var(--gold-500)) 100%
  );
}

.focus-gold {
  outline: none;
}
.focus-gold:focus-visible {
  box-shadow: 0 0 0 3px hsl(var(--gold) / 0.35);
}
tailwind.config.ts (patch)
ts

copy
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}'
  ],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        bg: 'hsl(var(--bg))',
        bgElev: 'hsl(var(--bg-elev))',
        card: 'hsl(var(--card))',
        overlay: 'hsl(var(--overlay))',
        fg: 'hsl(var(--fg))',
        fgMuted: 'hsl(var(--fg-muted))',
        fgOnGold: 'hsl(var(--fg-on-gold))',
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        gold: {
          900: 'hsl(var(--gold-900))',
          800: 'hsl(var(--gold-800))',
          700: 'hsl(var(--gold-700))',
          DEFAULT: 'hsl(var(--gold))',
          500: 'hsl(var(--gold-500))',
          400: 'hsl(var(--gold-400))'
        },
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        destructive: 'hsl(var(--destructive))'
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)'
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        cta: 'var(--shadow-cta)'
      },
      ringColor: {
        gold: 'hsl(var(--gold))'
      }
    }
  },
  plugins: []
} satisfies Config;
Acceptance
Tailwind exposes semantic tokens (bg, fg, gold, border, ring).
Utility classes .gold-gradient and .focus-gold available.
Visual check: gold accents on black surfaces look premium and legible.