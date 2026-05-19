# step-3-implementations/03-forms-rhf-zod/02-shared-form-components.md

## Title

Shared Form Components (A11y wrappers)

## Objective

Создать UI-поля для форм с поддержкой лейблов, хелперов и вывода ошибок (с aria-атрибутами). 

## Files

### src/components/form/form-field.tsx

```tsx
'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { ReactNode } from 'react';

interface FormFieldProps {
  name: string;
  label: string;
  description?: string;
  render: (props: { field: any; id: string; errorId: string }) => ReactNode;
}

export function FormField({ name, label, description, render }: FormFieldProps) {
  const { control } = useFormContext();
  const id = `field-${name}`;
  const errorId = `error-${name}`;
  const descId = `desc-${name}`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className="grid gap-1.5">
          <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
          {description && (
            <p id={descId} className="text-[0.8rem] text-fgMuted">
              {description}
            </p>
          )}
          {render({
            field,
            id,
            errorId: fieldState.error ? errorId : undefined,
          })}
          {fieldState.error && (
            <p id={errorId} className="text-[0.8rem] text-red-500 font-medium mt-1">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
```

### Пример использования: Input (src/components/ui/input.tsx)

*Можно использовать стандартные из shadcn, но нужно убедиться, что они поддерживают aria-invalid и aria-describedby.*

## Acceptance

- `FormField` прокидывает нужные id для A11y (связывание ошибки с инпутом).
- Нейтральный UI ошибок (красный текст снизу, но без красной рамки у поля — согласно B02).