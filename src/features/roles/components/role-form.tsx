'use client';

import { useState, type FormEvent } from 'react';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { roles as rolesTable } from '@/db/schema';
import { useAdminMutation } from '@/features/admin/hooks/use-admin-mutation';
import { createRoleAction, updateRoleAction } from '@/features/roles/actions';

type Role = typeof rolesTable.$inferSelect;

interface RoleFormProps {
  locale: SupportedLocale;
  role?: Role;
}

export function RoleForm({ locale, role }: RoleFormProps) {
  const { pending, refresh, run } = useAdminMutation();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isEdit = !!role;

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSaved(false);

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = (formData.get('description') as string) || '';

    if (isEdit && role) {
      const result = await run(() => updateRoleAction({ id: role.id, name, description }));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      refresh();
      return;
    }

    const result = await run(async () => {
      const created = await createRoleAction({ name, slug, description });
      if (!created.ok) {
        return created;
      }
      window.location.assign(localizeHref(locale, `/admin/roles/${created.data.id}`));
      return { ok: true as const };
    });
    if (!result.ok) {
      setError(result.error);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSubmit(new FormData(event.currentTarget));
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {saved ? (
        <div
          className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600"
          role="status"
        >
          Role updated successfully.
        </div>
      ) : null}

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
