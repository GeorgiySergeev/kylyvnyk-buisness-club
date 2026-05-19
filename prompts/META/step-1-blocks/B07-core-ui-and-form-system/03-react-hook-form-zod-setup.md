# 03-react-hook-form-zod-setup.md

## Title

React Hook Form + Zod Setup — schemas, resolver, helpers

## Objective

Set up react-hook-form with zodResolver, create a sample schema, and a base FormProvider wrapper to standardize forms.

## Steps

1) Install deps: react-hook-form, zod, @hookform/resolvers.
2) Create a form schema example and types.
3) Provide a FormProvider wrapper and a submit helper.

## Commands

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

## Files to add

- src/lib/validation/zod-helpers.ts
- src/components/forms/form-provider.tsx
- Example: src/features/_examples/forms/sample-form.tsx

### src/lib/validation/zod-helpers.ts

```ts
import { z } from 'zod';

export const emailSchema = z.string().email().max(256);
export const slugSchema = z
  .string()
  .min(2)
  .max(160)
  .regex(/^[a-z0-9-]+$/);

export const optionalUrl = z
  .string()
  .url()
  .max(512)
  .optional()
  .or(z.literal('').transform(() => undefined));
```

### src/components/forms/form-provider.tsx

```tsx
'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function ZodFormProvider<TSchema>({
  schema,
  defaultValues,
  children,
  mode = 'onSubmit',
}: {
  schema: any;
  defaultValues?: Partial<TSchema>;
  children: React.ReactNode;
  mode?: 'onChange' | 'onBlur' | 'onSubmit' | 'onTouched' | 'all';
}) {
  const methods = useForm<TSchema>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode,
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}
```

### src/features/_examples/forms/sample-form.tsx

```tsx
'use client';

import { z } from 'zod';
import { useFormContext } from 'react-hook-form';
import { ZodFormProvider } from '@/components/forms/form-provider';
import { Input, Label } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

type FormValues = z.infer<typeof schema>;

function Fields() {
  const { register, handleSubmit, formState } = useFormContext<FormValues>();
  const { toast } = useToast();

  return (
    <form
      onSubmit={handleSubmit((data) => toast({ title: 'Submitted', description: JSON.stringify(data) }))}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} aria-invalid={!!formState.errors.email} />
        {formState.errors.email && (
          <p className="text-sm text-destructive">{formState.errors.email.message}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} aria-invalid={!!formState.errors.name} />
        {formState.errors.name && (
          <p className="text-sm text-destructive">{formState.errors.name.message}</p>
        )}
      </div>
      <button className="px-5 py-3 rounded-md border border-border hover:bg-bgElev focus-gold">
        Submit
      </button>
    </form>
  );
}

export default function SampleForm() {
  return (
    <ZodFormProvider<FormValues> schema={schema} defaultValues={{}}>
      <Fields />
    </ZodFormProvider>
  );
}
```

## Acceptance

- RHF + Zod work together; validation messages appear.
- FormProvider wrapper simplifies schema-driven forms.
- Sample form submits and displays toast with payload.
