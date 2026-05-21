# 04-tailwind-setup.md

## Title

Tailwind CSS Base Setup (tokens-ready)

## Objective

Install Tailwind CSS and define initial black & gold tokens via CSS variables.

## Steps

1. Install Tailwind deps and init config
2. Configure content globs and theme extends
3. Add global CSS with variables for black & gold

## Commands

```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm exec tailwindcss init -p
```

## Files to modify/create

- tailwind.config.ts
- postcss.config.js (ensure present from init)
- src/app/globals.css

### tailwind.config.ts

```ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/features/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        bg: 'hsl(var(--bg))',
        fg: 'hsl(var(--fg))',
        gold: {
          DEFAULT: 'hsl(var(--gold))',
          50: 'hsl(var(--gold-50))',
          100: 'hsl(var(--gold-100))',
        },
        muted: 'hsl(var(--muted))',
        border: 'hsl(var(--border))',
      },
      borderRadius: {
        lg: '14px',
        md: '10px',
        sm: '8px',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: 0 0% 4%;
  --fg: 0 0% 96%;
  --muted: 0 0% 30%;
  --border: 0 0% 18%;
  --gold: 46 85% 55%;
  --gold-50: 46 85% 65%;
  --gold-100: 46 85% 75%;
}

html,
body,
#__next {
  height: 100%;
}
body {
  background: hsl(var(--bg));
  color: hsl(var(--fg));
}
```

## Acceptance

- Tailwind classes render
- Colors available via theme tokens
- Dark styling by default
