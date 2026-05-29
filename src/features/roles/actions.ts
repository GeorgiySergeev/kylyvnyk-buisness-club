'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { permissions, roles, userRoles } from '@/db/schema';
import { RESOURCES } from '@/db/schema/permission';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';

const roleCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(/^[a-z_]+$/, 'Slug must be lowercase letters and underscores only'),
  description: z.string().max(500).optional().default(''),
});

const roleUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().default(''),
});

const permissionUpdateSchema = z.object({
  roleId: z.string().uuid(),
  permissions: z.array(
    z.object({
      resource: z.enum(RESOURCES),
      canView: z.boolean(),
      canCreate: z.boolean(),
      canEdit: z.boolean(),
      canDelete: z.boolean(),
    }),
  ),
});

const assignRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

const revokeRoleSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
});

function revalidateAll() {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(localizeHref(locale, '/admin/roles'));
    revalidatePath(localizeHref(locale, '/admin/users'));
  }
}

export async function createRoleAction(rawInput: unknown) {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false as const, code: 'unauthorized' as const, error: 'Unauthorized.' };

  const parsed = roleCreateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, code: 'validation' as const, error: parsed.error.issues.map((i) => i.message).join('; ') };
  }

  const input = parsed.data;

  const existing = await db.query.roles.findFirst({
    where: (table, { eq }) => eq(table.slug, input.slug),
  });
  if (existing) {
    return { ok: false as const, code: 'conflict' as const, error: 'A role with this slug already exists.' };
  }

  const [role] = await db
    .insert(roles)
    .values({
      name: input.name,
      slug: input.slug,
      description: input.description || null,
      isSystem: false,
    })
    .returning();

  const defaultPerms = RESOURCES.map((resource) => ({
    roleId: role.id,
    resource,
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  }));
  await db.insert(permissions).values(defaultPerms);

  await createAuditLog({
    action: 'ROLE_CREATED',
    actorUserId: admin.data.id,
    entityId: role.id,
    entityType: 'role',
    payload: { name: role.name, slug: role.slug },
  });

  revalidateAll();
  return { ok: true as const, data: { id: role.id } };
}

export async function updateRoleAction(rawInput: unknown) {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false as const, code: 'unauthorized' as const, error: 'Unauthorized.' };

  const parsed = roleUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, code: 'validation' as const, error: parsed.error.issues.map((i) => i.message).join('; ') };
  }

  const input = parsed.data;

  const role = await db.query.roles.findFirst({
    where: (table, { eq, and: _and }) => _and(eq(table.id, input.id), isNull(table.deletedAt)),
  });
  if (!role) {
    return { ok: false as const, code: 'not_found' as const, error: 'Role not found.' };
  }

  await db
    .update(roles)
    .set({ name: input.name, description: input.description || null, updatedAt: new Date() })
    .where(eq(roles.id, input.id));

  await createAuditLog({
    action: 'ROLE_UPDATED',
    actorUserId: admin.data.id,
    entityId: role.id,
    entityType: 'role',
    payload: { name: input.name },
  });

  revalidateAll();
  return { ok: true as const, data: { id: role.id } };
}

export async function deleteRoleAction(rawInput: unknown) {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false as const, code: 'unauthorized' as const, error: 'Unauthorized.' };

  const parsed = z.object({ id: z.string().uuid() }).safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, code: 'validation' as const, error: 'Invalid role ID.' };
  }

  const { id } = parsed.data;

  const role = await db.query.roles.findFirst({ where: (table, { eq }) => eq(table.id, id) });
  if (!role) {
    return { ok: false as const, code: 'not_found' as const, error: 'Role not found.' };
  }

  if (role.isSystem) {
    return { ok: false as const, code: 'forbidden' as const, error: 'System roles cannot be deleted.' };
  }

  const assignmentCount = await db.$count(
    userRoles,
    and(eq(userRoles.roleId, id)),
  );
  if (assignmentCount > 0) {
    return { ok: false as const, code: 'conflict' as const, error: `Cannot delete role: ${assignmentCount} user(s) are assigned to it.` };
  }

  await db.transaction(async (tx) => {
    await tx.delete(permissions).where(eq(permissions.roleId, id));
    await tx.delete(roles).where(eq(roles.id, id));
  });

  await createAuditLog({
    action: 'ROLE_DELETED',
    actorUserId: admin.data.id,
    entityId: id,
    entityType: 'role',
    payload: { name: role.name, slug: role.slug },
  });

  revalidateAll();
  return { ok: true as const, data: { id } };
}

export async function updatePermissionsAction(rawInput: unknown) {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false as const, code: 'unauthorized' as const, error: 'Unauthorized.' };

  const parsed = permissionUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, code: 'validation' as const, error: parsed.error.issues.map((i) => i.message).join('; ') };
  }

  const input = parsed.data;

  for (const perm of input.permissions) {
    await db
      .insert(permissions)
      .values({
        roleId: input.roleId,
        resource: perm.resource,
        canView: perm.canView,
        canCreate: perm.canCreate,
        canEdit: perm.canEdit,
        canDelete: perm.canDelete,
      })
      .onConflictDoUpdate({
        target: [permissions.roleId, permissions.resource],
        set: {
          canView: perm.canView,
          canCreate: perm.canCreate,
          canEdit: perm.canEdit,
          canDelete: perm.canDelete,
          updatedAt: new Date(),
        },
      });
  }

  await createAuditLog({
    action: 'PERMISSIONS_UPDATED',
    actorUserId: admin.data.id,
    entityId: input.roleId,
    entityType: 'role',
    payload: { permissionCount: input.permissions.length },
  });

  revalidateAll();
  return { ok: true as const, data: { roleId: input.roleId } };
}

export async function assignRoleAction(rawInput: unknown) {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false as const, code: 'unauthorized' as const, error: 'Unauthorized.' };

  const parsed = assignRoleSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, code: 'validation' as const, error: parsed.error.issues.map((i) => i.message).join('; ') };
  }

  const { userId, roleId } = parsed.data;

  const role = await db.query.roles.findFirst({
    where: (table, { and: _and, eq: _eq }) => _and(_eq(table.id, roleId), isNull(table.deletedAt)),
  });
  if (!role) {
    return { ok: false as const, code: 'not_found' as const, error: 'Role not found.' };
  }

  const existing = await db.query.userRoles.findFirst({
    where: (table, { and: _and, eq: _eq }) => _and(_eq(table.userId, userId), _eq(table.roleId, roleId)),
  });
  if (existing) {
    return { ok: false as const, code: 'conflict' as const, error: 'User already has this role.' };
  }

  await db.insert(userRoles).values({ userId, roleId, assignedById: admin.data.id });

  await createAuditLog({
    action: 'ROLE_ASSIGNED',
    actorUserId: admin.data.id,
    entityId: userId,
    entityType: 'user',
    payload: { roleId, roleName: role.name },
  });

  revalidateAll();
  return { ok: true as const, data: { userId, roleId } };
}

export async function revokeRoleAction(rawInput: unknown) {
  const admin = await getCurrentUserWithRole('ADMIN');
  if (!admin.ok) return { ok: false as const, code: 'unauthorized' as const, error: 'Unauthorized.' };

  const parsed = revokeRoleSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, code: 'validation' as const, error: parsed.error.issues.map((i) => i.message).join('; ') };
  }

  const { userId, roleId } = parsed.data;

  const deleted = await db
    .delete(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
    .returning({ id: userRoles.id });

  if (deleted.length === 0) {
    return { ok: false as const, code: 'not_found' as const, error: 'Role assignment not found.' };
  }

  await createAuditLog({
    action: 'ROLE_REVOKED',
    actorUserId: admin.data.id,
    entityId: userId,
    entityType: 'user',
    payload: { roleId },
  });

  revalidateAll();
  return { ok: true as const, data: { userId, roleId } };
}
