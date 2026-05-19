# step-3-implementations/03-forms-rhf-zod/01-rhf-zod-wiring.md

## Title

RHF + Zod Wiring (ZodFormProvider)

## Objective

Обертка для удобного связывания Zod-схемы, RHF useForm и HTML-формы.

## Files

### src/components/form/zod-form-provider.tsx

```tsx
'use client';

import { useForm, FormProvider, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface ZodFormProviderProps<T extends z.ZodType> {
  schema: T;
  defaultValues: z.infer<T>;
  onSubmit: (data: z.infer<T>) => Promise<void> | void;
  children: (methods: UseFormReturn<z.infer<T>>) => React.ReactNode;
  className?: string;
}

export function ZodFormProvider<T extends z.ZodType>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: ZodFormProviderProps<T>) {
  const methods = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={className} noValidate>
        {children(methods)}
      </form>
    </FormProvider>
  );
}
```

## Acceptance

- Обертка типизирует `defaultValues` и `onSubmit` исходя из Zod-схемы.
- Прокидывает контекст RHF (FormProvider) вниз для работы `useFormContext` в полях.