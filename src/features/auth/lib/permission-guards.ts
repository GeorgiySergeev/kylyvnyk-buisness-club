import 'server-only';

import { redirect } from 'next/navigation';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { db } from '@/db/client';
import type { PermissionAction, Resource } from '@/db/schema/permission';
import { canAccess, isSuperAdmin } from '@/lib/auth/permissions';

import { requireUser } from './current-user';

export async function guardSuperAdmin(locale: SupportedLocale) {
  const user = await requireUser(locale);
  const admin = await isSuperAdmin(user.id);

  if (!admin) {
    redirect(localizeHref(locale, '/admin'));
  }

  return user;
}

export async function guardPermission(
  locale: SupportedLocale,
  resource: Resource,
  action: PermissionAction = 'view',
) {
  const user = await requireUser(locale);
  const permitted = await canAccess(user.id, resource, action);

  if (!permitted) {
    const adminAccess = await isSuperAdmin(user.id);
    if (!adminAccess) {
      redirect(localizeHref(locale, '/'));
    }
    redirect(localizeHref(locale, '/admin'));
  }

  return user;
}

export async function checkPermission(
  userId: string,
  resource: Resource,
  action: PermissionAction,
): Promise<boolean> {
  return canAccess(userId, resource, action);
}

export async function checkSuperAdmin(userId: string): Promise<boolean> {
  return isSuperAdmin(userId);
}

export async function getUserRoleSlugs(userId: string): Promise<string[]> {
  const assignments = await db.query.userRoles.findMany({
    where: (table, { eq }) => eq(table.userId, userId),
    with: {
      role: {
        columns: {
          slug: true,
        },
      },
    },
  });
  return assignments.map((a) => a.role.slug);
}
