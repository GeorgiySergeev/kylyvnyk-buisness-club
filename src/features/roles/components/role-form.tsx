'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { roles as rolesTable } from '@/db/schema';
import { createRoleAction, updateRoleAction } from '@/features/roles/actions';

type Role = typeof rolesTable.$inferSelect;

interface RoleFormProps {
  locale: SupportedLocale;
  role?: Role;
}

export function RoleForm({ locale, role }: RoleFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isEdit = !!role;

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = (formData.get('description') as string) || '';

    if (isEdit && role) {
      const result = await updateRoleAction({ id: role.id, name, description });
      if (!result.ok) {
        setError(result.error);
        setPending(false);
        return;
      }
      router.refresh();
    } else {
      const result = await createRoleAction({ name, slug, description });
      if (!result.ok) {
        setError(result.error);
        setPending(false);
        return;
      }
      router.push(localizeHref(locale, `/admin/roles/${result.data.id}`));
    }

    setPending(false);
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={role?.name ?? ''}
          placeholder="e.g. Content Manager"
          required
          minLength={1}
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={role?.slug ?? ''}
          placeholder="e.g. content_manager"
          required
          minLength={1}
          maxLength={100}
          pattern="^[a-z_]+$"
          title="Lowercase letters and underscores only"
          disabled={isEdit}
          className={isEdit ? 'cursor-not-allowed opacity-60' : ''}
        />
        {isEdit && (
          <p className="text-xs text-muted-foreground">Slug cannot be changed after creation.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={role?.description ?? ''}
          placeholder="Optional description of this role"
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="bg-foreground text-background hover:bg-foreground/90">
          {pending ? 'Saving...' : isEdit ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
}
