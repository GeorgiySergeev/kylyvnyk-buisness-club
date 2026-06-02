import { and, count, desc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { Check, Minus } from 'lucide-react';
import Link from 'next/link';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { db } from '@/db/client';
import { auditLogs, memberships, permissions, roles, userRoles, users } from '@/db/schema';
import type { Resource } from '@/db/schema/permission';
import { RESOURCES } from '@/db/schema/permission';
import { AdminDataTableShell, AdminMetricCard, AdminPageHeader, AdminPanel, AdminStatusBadge } from '@/features/admin/components/admin-ui';
import { formatPlatformRole } from '@/features/admin/lib/access-display';
import { guardSuperAdmin } from '@/features/auth/lib/permission-guards';
import { resolveEffectiveMembership } from '@/features/billing/lib/membership-resolver';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AccessCenterPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
}

const ACCESS_AUDIT_ACTIONS = [
  'ADMIN_USER_ROLE_UPDATED',
  'ADMIN_USER_STATUS_UPDATED',
  'ADMIN_USER_MEMBERSHIP_UPDATED',
  'ADMIN_USER_BANNED',
  'ROLE_ASSIGNED',
  'ROLE_REVOKED',
  'ROLE_CREATED',
  'ROLE_UPDATED',
  'ROLE_DELETED',
  'PERMISSIONS_UPDATED',
];

export default async function AccessCenterPage({ params }: AccessCenterPageProps) {
  const { locale } = await params;
  await guardSuperAdmin(locale);
  const t = getT('admin', locale);

  const [
    allUsers,
    allRoles,
    latestAuditLogs,
    totalMemberships,
    totalUserRoles,
    totalPermissions,
    totalAuditLogs,
    activeMembershipCount,
    activeUsersCount,
    adminUsersCount,
    bannedUsersCount,
    usersWithoutRbacCount,
    vipUsersCount,
  ] = await Promise.all([
    db.query.users.findMany({
      columns: {
        displayName: true,
        email: true,
        id: true,
        phone: true,
        role: true,
        status: true,
      },
      limit: 50,
      orderBy: [desc(users.createdAt)],
      where: isNull(users.deletedAt),
      with: {
        memberships: {
          columns: { createdAt: true, planCode: true, status: true, updatedAt: true },
          orderBy: [desc(memberships.updatedAt)],
        },
        roleAssignments: {
          with: { role: true },
        },
      },
    }),
    db.query.roles.findMany({
      orderBy: [desc(roles.createdAt)],
      where: isNull(roles.deletedAt),
      with: { permissions: true, userAssignments: true },
    }),
    db.query.auditLogs.findMany({
      columns: {
        action: true,
        createdAt: true,
        entityId: true,
        entityType: true,
        id: true,
      },
      limit: 12,
      orderBy: [desc(auditLogs.createdAt)],
      where: inArray(auditLogs.action, ACCESS_AUDIT_ACTIONS),
    }),
    db.$count(memberships),
    db.$count(userRoles),
    db.$count(permissions),
    db.$count(auditLogs),
    db.$count(memberships, eq(memberships.status, 'ACTIVE')),
    db.$count(users, and(isNull(users.deletedAt), eq(users.status, 'ACTIVE'))),
    db.$count(users, and(isNull(users.deletedAt), inArray(users.role, ['ADMIN', 'OWNER']))),
    db.$count(users, and(isNull(users.deletedAt), eq(users.status, 'BANNED'))),
    db.$count(
      users,
      and(
        isNull(users.deletedAt),
        sql`NOT EXISTS (
          SELECT 1
          FROM ${userRoles}
          WHERE ${userRoles.userId} = ${users.id}
        )`,
      ),
    ),
    db.$count(
      memberships,
      and(eq(memberships.status, 'ACTIVE'), eq(memberships.planCode, 'VIP')),
    ),
  ]);

  const [totalUsers] = await db.select({ value: count() }).from(users).where(isNull(users.deletedAt));
  const totalUserCount = totalUsers?.value ?? 0;

  const metrics = [
    { label: t('accessMetricUsers'), value: totalUserCount },
    { label: t('accessMetricAdmins'), tone: 'info' as const, value: adminUsersCount },
    { label: t('accessMetricActiveMemberships'), tone: 'success' as const, value: activeMembershipCount },
    { label: t('accessMetricWithoutRbac'), tone: 'warning' as const, value: usersWithoutRbacCount },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        description={t('accessDescription')}
        eyebrow={t('adminRole')}
        title={t('accessTitle')}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <AdminMetricCard
            key={metric.label}
            label={metric.label}
            meta={t('liveDatabaseSnapshot')}
            tone={metric.tone}
            value={metric.value}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <AdminPanel description={t('accessOverviewDescription')} title={t('accessOverviewTitle')}>
          <div className="space-y-3">
            <AccessBar label={t('accessActiveUsers')} total={totalUserCount} value={activeUsersCount} />
            <AccessBar label={t('accessBannedUsers')} total={totalUserCount} value={bannedUsersCount} />
            <AccessBar label={t('accessVipMembers')} total={totalUserCount} value={vipUsersCount} />
            <AccessBar label={t('accessWithoutRbac')} total={totalUserCount} value={usersWithoutRbacCount} />
          </div>
        </AdminPanel>

        <AdminPanel description={t('accessDatabaseDescription')} title={t('accessDatabaseTitle')}>
          <div className="grid gap-2 text-sm">
            <DatabaseStateRow label="users" value={totalUsers?.value ?? 0} />
            <DatabaseStateRow label="memberships" value={totalMemberships} />
            <DatabaseStateRow label="roles" value={allRoles.length} />
            <DatabaseStateRow label="user_roles" value={totalUserRoles} />
            <DatabaseStateRow label="permissions" value={totalPermissions} />
            <DatabaseStateRow label="audit_logs" value={totalAuditLogs} />
          </div>
        </AdminPanel>
      </div>

      <AdminPanel description={t('accessUsersDescription')} title={t('accessUsersTitle')}>
        <AdminDataTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('user')}</TableHead>
                <TableHead>{t('accountStatus')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead>{t('membership')}</TableHead>
                <TableHead>{t('rolesTitle')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allUsers.map((user) => {
                const membership = resolveEffectiveMembership(user.memberships)?.planCode ?? t('noMembership');
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Link
                        className="font-medium text-ds-text hover:text-ds-accent"
                        href={localizeHref(locale, `/admin/users/${user.id}`)}
                      >
                        {user.displayName?.trim() || 'Not set'}
                      </Link>
                      {user.email ? (
                        <p className="text-xs text-ds-text-muted">{user.email}</p>
                      ) : null}
                    </TableCell>
                    <TableCell><AdminStatusBadge>{user.status}</AdminStatusBadge></TableCell>
                    <TableCell>{formatPlatformRole(user.role)}</TableCell>
                    <TableCell><AdminStatusBadge>{membership}</AdminStatusBadge></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {user.roleAssignments.length === 0 ? (
                          <span className="text-xs text-ds-text-muted">{t('notDefined')}</span>
                        ) : (
                          user.roleAssignments.map((assignment) => (
                            <AdminStatusBadge key={assignment.id} tone="info">
                              {assignment.role.name}
                            </AdminStatusBadge>
                          ))
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </AdminDataTableShell>
      </AdminPanel>

      <AdminPanel description={t('accessMatrixDescription')} title={t('accessMatrixTitle')}>
        <AdminDataTableShell>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('roleName')}</TableHead>
                <TableHead>{t('users')}</TableHead>
                {RESOURCES.map((resource) => (
                  <TableHead key={resource}>{resource}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <Link
                      className="font-medium text-ds-text hover:text-ds-accent"
                      href={localizeHref(locale, `/admin/roles/${role.id}`)}
                    >
                      {role.name}
                    </Link>
                    <p className="text-xs text-ds-text-muted">{role.slug}</p>
                  </TableCell>
                  <TableCell>{role.userAssignments.length}</TableCell>
                  {RESOURCES.map((resource) => (
                    <TableCell key={resource}>
                      <PermissionGlyphs permissions={role.permissions} resource={resource} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminDataTableShell>
      </AdminPanel>

      <AdminPanel description={t('accessAuditDescription')} title={t('accessAuditTitle')}>
        <div className="space-y-3">
          {latestAuditLogs.length === 0 ? (
            <p className="text-sm text-ds-text-muted">{t('noAuditLogs')}</p>
          ) : (
            latestAuditLogs.map((log) => (
              <div className="rounded-md border border-ds-border bg-ds-bg/40 px-3 py-2" key={log.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge tone="info">{log.action}</AdminStatusBadge>
                  <span className="text-xs text-ds-text-muted">
                    {log.createdAt.toLocaleString('en-US')}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ds-text-muted">
                  {log.entityType ?? 'N/A'} {log.entityId ? `· ${log.entityId}` : ''}
                </p>
              </div>
            ))
          )}
        </div>
      </AdminPanel>
    </div>
  );
}

function AccessBar({ label, total, value }: { label: string; total: number; value: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ds-text-muted">{label}</span>
        <span className="font-medium text-ds-text">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-ds-surface-2">
        <div className="h-full rounded-full bg-cyan-400" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function DatabaseStateRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-ds-border bg-ds-bg/40 px-3 py-2">
      <span className="font-mono text-xs text-ds-text-muted">{label}</span>
      <span className="font-mono text-sm font-semibold text-ds-text">{value}</span>
    </div>
  );
}

function PermissionGlyphs({
  permissions,
  resource,
}: {
  permissions: Array<{
    canCreate: boolean;
    canDelete: boolean;
    canEdit: boolean;
    canView: boolean;
    resource: string;
  }>;
  resource: Resource;
}) {
  const permission = permissions.find((item) => item.resource === resource);
  const flags = [
    permission?.canView,
    permission?.canCreate,
    permission?.canEdit,
    permission?.canDelete,
  ];

  return (
    <div className="flex gap-1 text-ds-text-muted" aria-label={resource}>
      {flags.map((flag, index) =>
        flag ? (
          <Check className="size-3.5 text-cyan-400" key={index} />
        ) : (
          <Minus className="size-3.5" key={index} />
        ),
      )}
    </div>
  );
}
