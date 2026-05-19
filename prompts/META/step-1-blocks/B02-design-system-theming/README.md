# B02: Design System & Theming

## Overview

This block contains the step-by-step instructions for establishing the foundational design system and theming for the **KYLYVNYK CLUB** project. 

The focus is on creating a premium, accessible, and scalable "black & gold" luxury aesthetic. It includes setting up design tokens, typography, accessible contrast guidelines, core UI components, and iconography.

## Steps

1. **[01. Tailwind Design Tokens](./01-tailwind-design-tokens.md)**
   Define semantic CSS variables and Tailwind tokens for a luxury black & gold, mobile-first UI. Extends the default Tailwind theme with specific colors, radii, shadows, and utility classes.

2. **[02. Dark Theme & WCAG Contrast](./02-dark-theme-wcag-contrast.md)**
   Guarantee accessible contrast (WCAG 2.1 AA) for text and iconography on dark surfaces. Provides a tokens preview page to visually validate accessibility and documents "do/don't" rules for combining colors.

3. **[03. Typography Base Styles](./03-typography-base-styles.md)**
   Install a premium sans-serif font (Plus Jakarta Sans) via `next/font`, configure the base typographic scale, and set up markdown/prose defaults using `@tailwindcss/typography`.

4. **[04. Theme Provider & CSS Variables](./04-theme-provider-css-variables.md)**
   Introduce a `next-themes` ThemeProvider to manage the theme class on the `<html>` element. Establishes a dark-theme baseline while allowing for future extensibility.

5. **[05. Premium UI Presets](./05-premium-ui-presets.md)**
   Create reusable, accessible UI presets aligned with the design system, including gold CTA buttons, premium cards with shadows/borders, and scalable section wrappers.

6. **[06. Icons Setup (Lucide & Custom)](./06-icons-setup.md)**
   Install Lucide icons and create a standard `<Icon>` wrapper. Establish a folder and convention for creating custom brand SVGs as React components without external loaders.

## Overall Acceptance Criteria

Upon completion of this block:
- The design system implements a consistent "black & gold" dark theme.
- Tailwind CSS utilizes semantic tokens correctly (bg, fg, gold, border, ring).
- Typography is clean and premium, utilizing the configured font and scale.
- All UI components and text combinations adhere to WCAG AA contrast standards.
- Reusable UI elements (Buttons, Cards, Sections, Icons) are fully accessible, scalable, and match the brand's luxury aesthetic.
- Custom SVGs and Lucide icons render successfully through standard React components.
