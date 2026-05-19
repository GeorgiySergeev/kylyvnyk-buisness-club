# 04-formfield-components-and-errors.md

## Title

FormField Components — consistent labels, help text, and errors

## Objective

Create reusable Field, FieldLabel, FieldError, and FieldHelper components that integrate with RHF and a11y (aria-describedby).

## Steps

1) Build Field container to compute ids for label/help/error.
2) Add Label, Helper, and Error components that bind to RHF state.
3) Provide controlled wrappers for Input and Textarea with error styles.

## Files to add

- src/components/forms/field.tsx
- src/components/forms/controls.tsx

### src/components/forms/field.tsx

```tsx
'use client';

import { ReactNode, useId } from 'react';
import { useFormContext, FieldError } from 'react-hook-form';
import { Label as BaseLabel } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

export function Field({
  name,
  label,
  children,
  className,
  required,
}: {
  name: string;
  label?: ReactNode;
  children: (ids: { inputId: string; helpId: string; errorId: string }) => ReactNode;
  className?: string;
  required?: boolean;
}) {
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <BaseLabel htmlFor={inputId}>
          {label} {required ? <span className="text-gold-400">*</span> : null}
        </BaseLabel>
      )}
      {children({ inputId, helpId, errorId })}
      <FieldErrorText name={name} id={errorId} />
    </div>
  );
}

export function FieldHelperText({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null;
  return <p id={id} className="text-sm text-fgMuted">{children}</p>;
}

export function FieldErrorText({ name, id }: { name: string; id: string }) {
  const { formState } = useFormContext();
  const err = (formState.errors as Record<string, FieldError | undefined>)[name];
  if (!err) return null;
  return (
    <p id={id} className="text-sm text-destructive">
      {err.message?.toString()}
    </p>
  );
}
```

### src/components/forms/controls.tsx

```tsx
'use client';

import { useFormContext } from 'react-hook-form';
import { Input, Textarea, Select } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

export function InputControl({
  name,
  id,
  describedBy,
  className,
  ...rest
}: React.ComponentProps<typeof Input> & {
  name: string;
  id: string;
  describedBy?: string;
}) {
  const { register, formState } = useFormContext();
  const hasError = Boolean((formState.errors as any)[name]);
  return (
    <Input
      id={id}
      aria-invalid={hasError}
      aria-describedby={describedBy}
      className={cn(hasError && 'border-destructive', className)}
      {...register(name)}
      {...rest}
    />
  );
}

export function TextareaControl({
  name,
  id,
  describedBy,
  className,
  ...rest
}: React.ComponentProps<typeof Textarea> & {
  name: string;
  id: string;
  describedBy?: string;
}) {
  const { register, formState } = useFormContext();
  const hasError = Boolean((formState.errors as any)[name]);
  return (
    <Textarea
      id={id}
      aria-invalid={hasError}
      aria-describedby={describedBy}
      className={cn(hasError && 'border-destructive', className)}
      {...register(name)}
      {...rest}
    />
  );
}
```

## Usage example

```tsx
'use client';

import { z } from 'zod';
import { ZodFormProvider } from '@/components/forms/form-provider';
import { Field, FieldHelperText } from '@/components/forms/field';
import { InputControl, TextareaControl } from '@/components/forms/controls';

const schema = z.object({
  title: z.string().min(3),
  notes: z.string().max(280).optional(),
});

type Values = z.infer<typeof schema>;

export default function Example() {
  return (
    <ZodFormProvider<Values> schema={schema} defaultValues={{}}>
      <form className="space-y-4">
        <Field name="title" label="Title" required>
          {({ inputId, helpId, errorId }) => (
            <>
              <InputControl name="title" id={inputId} describedBy={`${helpId} ${errorId}`} />
              <FieldHelperText id={helpId}>3–120 characters.</FieldHelperText>
            </>
          )}
        </Field>

        <Field name="notes" label="Notes">
          {({ inputId, helpId, errorId }) => (
            <>
              <TextareaControl name="notes" id={inputId} describedBy={`${helpId} ${errorId}`} />
              <FieldHelperText id={helpId}>Optional. Max 280 chars.</FieldHelperText>
            </>
          )}
        </Field>

        <button className="px-5 py-3 rounded-md border border-border hover:bg-bgElev focus-gold">
          Save
        </button>
      </form>
    </ZodFormProvider>
  );
}
```

## Acceptance

- Labels associate with inputs; aria-describedby wires helper+error.
- Error state toggles border color and error text appears.
- Works with any RHF schema using the same building blocks.
