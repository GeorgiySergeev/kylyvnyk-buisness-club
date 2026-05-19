# step-3-implementations/03-forms-rhf-zod/03-validation-schemas-patterns.md

## Title

Common Validation Schemas

## Objective

Библиотека переиспользуемых Zod-патернов (slug, url, телефон, имя).

## Files

### src/lib/schemas/common.ts

```ts
import { z } from 'zod';

export const slugSchema = z
  .string()
  .min(2)
  .max(160)
  .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, digits and dashes');

export const nameSchema = z.string().min(2).max(200);

export const phoneSchema = z
  .string()
  .min(5)
  .max(50)
  .regex(/^[0-9+()\\-\\s]+$/, 'Invalid phone number')
  .optional()
  .or(z.literal('')); // Allow empty string as optional

export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .max(512)
  .optional()
  .or(z.literal(''));
```

## Acceptance
- Общие форматы проверяются унифицированно во всех формах.