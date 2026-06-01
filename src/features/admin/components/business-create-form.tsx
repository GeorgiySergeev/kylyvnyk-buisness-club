'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { createBusinessAction } from '../actions/business-admin.action';

const createBusinessFormSchema = z.object({
  ownerPhone: z.string().trim().min(6, 'Phone must be at least 6 characters').max(32),
  name: z.string().trim().min(1, 'Name is required').max(200),
  slug: z.string().trim().max(120),
  description: z.string().trim().max(5000),
  website: z.string().trim().max(500),
  phone: z.string().trim().max(32),
  email: z.string().trim().max(200),
  status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'HIDDEN', 'DECLINED']),
});

type CreateBusinessFormValues = z.infer<typeof createBusinessFormSchema>;

interface BusinessCreateFormLabels {
  create: string;
  ownerPhone: string;
  name: string;
  slug: string;
  description: string;
  website: string;
  phone: string;
  email: string;
  status: string;
}

interface BusinessCreateFormProps {
  labels: BusinessCreateFormLabels;
  locale: SupportedLocale;
}

export function BusinessCreateForm({ labels, locale }: BusinessCreateFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<CreateBusinessFormValues>({
    defaultValues: {
      description: '',
      email: '',
      name: '',
      ownerPhone: '',
      phone: '',
      slug: '',
      status: 'DRAFT',
      website: '',
    },
    resolver: zodResolver(createBusinessFormSchema),
  });

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const result = await createBusinessAction({
        ownerPhone: values.ownerPhone.trim(),
        name: values.name.trim(),
        slug: values.slug.trim() || undefined,
        description: values.description.trim() || null,
        website: values.website.trim() || null,
        phone: values.phone.trim() || null,
        email: values.email.trim() || null,
        status: values.status,
      });

      if (!result.ok) {
        setError('root', { message: result.error, type: 'server' });
        return;
      }

      router.push(localizeHref(locale, `/admin/businesses/${result.data.businessId}`));
    });
  });

  return (
    <form className="max-w-2xl space-y-5 rounded-lg border border-border bg-card p-5" noValidate onSubmit={onSubmit}>
      {errors.root?.message ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {errors.root.message}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ownerPhone">{labels.ownerPhone}</Label>
          <Input
            aria-describedby={errors.ownerPhone ? 'ownerPhone-error' : undefined}
            aria-invalid={Boolean(errors.ownerPhone)}
            disabled={pending}
            id="ownerPhone"
            placeholder="+380501234567"
            required
            {...register('ownerPhone')}
          />
          {errors.ownerPhone?.message ? (
            <p className="text-sm text-destructive" id="ownerPhone-error" role="alert">
              {errors.ownerPhone.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">{labels.name}</Label>
          <Input
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={Boolean(errors.name)}
            disabled={pending}
            id="name"
            placeholder="Business name"
            required
            {...register('name')}
          />
          {errors.name?.message ? (
            <p className="text-sm text-destructive" id="name-error" role="alert">
              {errors.name.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="slug">{labels.slug}</Label>
          <Input
            aria-describedby={errors.slug ? 'slug-error' : undefined}
            aria-invalid={Boolean(errors.slug)}
            disabled={pending}
            id="slug"
            placeholder="my-business-slug"
            {...register('slug')}
          />
          <p className="text-xs text-muted-foreground">Auto-generated from name if left empty</p>
          {errors.slug?.message ? (
            <p className="text-sm text-destructive" id="slug-error" role="alert">
              {errors.slug.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">{labels.status}</Label>
          <select
            className="min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={pending}
            id="status"
            {...register('status')}
          >
            <option value="DRAFT">Draft</option>
            <option value="PENDING">Pending</option>
            <option value="PUBLISHED">Published</option>
            <option value="HIDDEN">Hidden</option>
            <option value="DECLINED">Declined</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{labels.description}</Label>
        <textarea
          className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={pending}
          id="description"
          placeholder="Business description"
          {...register('description')}
        />
        {errors.description?.message ? (
          <p className="text-sm text-destructive" id="description-error" role="alert">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="website">{labels.website}</Label>
          <Input
            disabled={pending}
            id="website"
            placeholder="https://example.com"
            type="url"
            {...register('website')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{labels.phone}</Label>
          <Input
            disabled={pending}
            id="phone"
            placeholder="+380501234567"
            {...register('phone')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{labels.email}</Label>
          <Input
            disabled={pending}
            id="email"
            placeholder="business@example.com"
            type="email"
            {...register('email')}
          />
        </div>
      </div>

      <Button disabled={pending} type="submit">
        {pending ? <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin" /> : null}
        {labels.create}
      </Button>
    </form>
  );
}
