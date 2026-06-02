import { and, desc, eq, inArray, isNull, or, sql } from 'drizzle-orm';
import { notFound } from 'next/navigation';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { auditLogs, permissions as permissionsTable, userRoles } from '@/db/schema';
import type { Resource } from '@/db/schema/permission';
import type { RoleAssignedUserRow, RoleAuditLogRow } from '@/features/admin/components/role-detail-tabs';
import { RoleDetailTabs } from '@/features/admin/components/role-detail-tabs';
import { guardSuperAdmin } from '@/features/auth/lib/permission-guards';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

const ROLE_ASSIGNMENT_ACTIONS = ['ROLE_ASSIGNED', 'ROLE_REVOKED'] as const;

interface RoleDetailPageProps {
  params: Promise<{
    locale: SupportedLocale;
    id: string;
  }>;
}

function formatAdminDateTime(value: Date) {
  return value.toLocaleString('en-US', {
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function summarizeAuditPayload(
  action: string,
  payload: unknown,
): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;

  if (action === 'ROLE_ASSIGNED' && typeof record.roleName === 'string') {
    return record.roleName;
  }
  if (action === 'ROLE_REVOKED' && typeof record.roleId === 'string') {
    return 'Role removed from user';
  }
  if (typeof record.name === 'string') {
    return record.name;
  }
  if (typeof record.slug === 'string') {
    return record.slug;
  }
  if (typeof record.permissionCount === 'number') {
    return `${record.permissionCount} resources`;
  }
  return null;
}

export default async function RoleDetailPage({ params }: RoleDetailPageProps) {
  const { locale, id } = await params;
  await guardSuperAdmin(locale);
  const t = getT('admin', locale);

  const role = await db.query.roles.findFirst({
    where: (table, { and: _and, eq: _eq }) => _and(_eq(table.id, id), isNull(table.deletedAt)),
  });

  if (!role) {
    notFound();
  }

  const [perms, assignments, rawAuditLogs] = await Promise.all([
    db.select().from(permissionsTable).where(eq(permissionsTable.roleId, id)),
    db.query.userRoles.findMany({
      orderBy: [desc(userRoles.createdAt)],
      where: eq(userRoles.roleId, id),
      with: {
        assignedBy: {
          columns: {
            displayName: true,
          },
        },
        user: {
          columns: {
            deletedAt: true,
            displayName: true,
            email: true,
            id: true,
            phone: true,
            status: true,
          },
        },
      },
    }),
    db.query.auditLogs.findMany({
      columns: {
        action: true,
        actorUserId: true,
        createdAt: true,
        entityId: true,
        entityType: true,
        id: true,
        ipAddress: true,
        payload: true,
      },
      limit: 150,
      orderBy: [desc(auditLogs.createdAt)],
      where: or(
        and(eq(auditLogs.entityType, 'role'), eq(auditLogs.entityId, id)),
        and(
          inArray(auditLogs.action, [...ROLE_ASSIGNMENT_ACTIONS]),
          sql`${auditLogs.payload}->>'roleId' = ${id}`,
        ),
      ),
      with: {
        actor: {
          columns: {
            displayName: true,
          },
        },
      },
    }),
  ]);

  const permLabels = {
    resource: t('resource'),
    canView: t('canView'),
    canCreate: t('canCreate'),
    canEdit: t('canEdit'),
    canDelete: t('canDelete'),
  };

  const assignedUsers: RoleAssignedUserRow[] = assignments.map((assignment) => ({
    assignedAt: formatAdminDateTime(assignment.createdAt),
    assignedByName: assignment.assignedBy?.displayName ?? null,
    email: assignment.user.email,
    id: assignment.user.id,
    isDeleted: assignment.user.deletedAt !== null,
    name: assignment.user.displayName?.trim() || 'Not set',
    phone: assignment.user.phone,
    status: assignment.user.status,
    userHref: localizeHref(locale, `/admin/users/${assignment.user.id}`),
  }));

  const auditLogRows: RoleAuditLogRow[] = rawAuditLogs
    .filter(
      (log) =>
        (log.entityType === 'role' && log.entityId === id) ||
        ROLE_ASSIGNMENT_ACTIONS.includes(log.action as (typeof ROLE_ASSIGNMENT_ACTIONS)[number]),
    )
    .map((log) => ({
      action: log.action,
      actorName: log.actor?.displayName ?? null,
      createdAt: formatAdminDateTime(log.createdAt),
      entityId: log.entityId,
      entityType: log.entityType,
      id: log.id,
      ipAddress: log.ipAddress,
      payloadSummary: summarizeAuditPayload(log.action, log.payload),
    }));

  return (
    <RoleDetailTabs
      assignedUsers={assignedUsers}
      auditLogs={auditLogRows}
      backHref={localizeHref(locale, '/admin/roles')}
      backLabel={t('backToRoles')}
      initialPermissions={perms.map((p) => ({
        resource: p.resource as Resource,
        canView: p.canView,
        canCreate: p.canCreate,
        canEdit: p.canEdit,
        canDelete: p.canDelete,
      }))}
      locale={locale}
      permLabels={permLabels}
      role={role}
      tabLabels={{
        accountStatus: t('accountStatus'),
        actions: t('actions'),
        assignedAt: t('assignedAt'),
        assignedBy: t('assignedBy'),
        auditActor: t('auditActor'),
        edit: t('editRole'),
        email: t('email'),
        name: t('name'),
        permissions: t('permissions'),
        phone: t('phone'),
        roleActivityDescription: t('roleActivityDescription'),
        roleNoActivity: t('roleNoActivity'),
        roleNoAssignedUsers: t('roleNoAssignedUsers'),
        roleNoAssignedUsersDescription: t('roleNoAssignedUsersDescription'),
        roleTabActivity: t('roleTabActivity'),
        roleTabUsers: t('roleTabUsers'),
        roleUsersDescription: t('roleUsersDescription'),
        status: t('status'),
        view: t('view'),
      }}
    />
  );
}
