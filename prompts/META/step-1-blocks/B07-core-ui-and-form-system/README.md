# B07: Core Ui And Form System

## Overview

This block outlines the step-by-step instructions for implementing the **Core Ui And Form System** functionality in the KYLYVNYK CLUB project.

## Steps

1. **[Base UI Components â€” inputs, selects, labels, cards (accessible + tokenized)](./01-base-ui-components.md)**
   Provide a minimal, accessible set of base UI components built on shadcn/ui and Tailwind tokens: Input, Textarea, Select, Label, Card. Unify styles and a small utility.

2. **[Feedback & Overlays â€” toast, alert, dialog, sheet](./02-feedback-and-overlays.md)**
   Add non-blocking feedback (toast), inline alerts, and overlay components (Dialog, Sheet) aligned with black & gold theme.

3. **[React Hook Form + Zod Setup â€” schemas, resolver, helpers](./03-react-hook-form-zod-setup.md)**
   Set up react-hook-form with zodResolver, create a sample schema, and a base FormProvider wrapper to standardize forms.

4. **[FormField Components â€” consistent labels, help text, and errors](./04-formfield-components-and-errors.md)**
   Create reusable Field, FieldLabel, FieldError, and FieldHelper components that integrate with RHF and a11y (aria-describedby).

5. **[Gold CTAs â€” primary, secondary, loading state (mobile-first)](./05-cta-buttons-gold-mobile-first.md)**
   Provide high-contrast, accessible CTA buttons consistent with black & gold theme. Include loading state and link-as-button variant.

6. **[Breadcrumbs & Tabs â€” navigation primitives for dashboards](./06-breadcrumbs-and-tabs.md)**
   Create accessible breadcrumbs and standardized tabs for Member/Business/Admin dashboards using shadcn Tabs.

## Overall Acceptance Criteria

Upon completion of this block:

- All configuration and implementations described in the steps are completed.
- The application runs correctly without errors.
- Code aligns with the project's quality and architectural standards.
