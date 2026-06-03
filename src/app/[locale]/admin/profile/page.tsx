import { and, count, desc, eq, inArray, isNull } from 'drizzle-orm';
import { Activity, BadgeCheck, ClipboardList, Database, ShieldCheck, UserRound } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { Button } from '@/components/ui/button';
import { db } from '@/db/client';
import { auditLogs, businesses, introductions, memberships, roles, userPermissionOverrides, users } from '@/db/schema';
import type { Resource } from '@/db/schema/permission';
import {
  AdminDescriptionList,
  AdminMetricCard,
  AdminPageHeader,
  AdminPanel,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { summarizePermissionRows } from '@/features/admin/lib/access-display';
import { guardAdmin } from '@/features/auth/lib/role-guards';
import { DashboardProfileSettingsForm } from '@/features/profile/components/dashboard-profile-settings-form';
import { RoleForm } from '@/features/roles/components/role-form';
import { getCurrentUserPermissions, getUserRolesWithPermissions, isSuperAdmin } from '@/lib/auth/permissions';
import { getCachedCities, getCachedCountries } from '@/lib/db/reference-data';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminProfilePageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    tab?: string;
  }>;
}

const ADMIN_PROFILE_AUDIT_ACTIONS = [
  'USER_PROFILE_UPDATED',
  'ADMIN_USER_ROLE_UPDATED',
  'ADMIN_USER_STATUS_UPDATED',
  'ADMIN_USER_MEMBERSHIP_UPDATED',
  'ROLE_ASSIGNED',
  'ROLE_REVOKED',
  'ROLE_CREATED',
  'ROLE_UPDATED',
  'ROLE_DELETED',
  'PERMISSIONS_UPDATED',
  'USER_PERMISSION_OVERRIDES_UPDATED',
] as const;

type ProfileTab = 'profile' | 'staff' | 'roles';

export default async function AdminProfilePage({ params, searchParams }: AdminProfilePageProps) {
  const { locale } = await params;
  const { tab } = await searchParams;
  const user = await guardAdmin(locale);
  const adminT = getT('admin', locale);
  const dashboardT = getT('dashboard', locale);

  const [
    countries,
    cities,
    ownRoles,
    ownAuditLogs,
    totalUsers,
    activeMemberships,
    pendingBusinesses,
    pendingIntroductions,
    userIsSuperAdmin,
  ] = await Promise.all([
    getCachedCountries(),
    getCachedCities(),
    getUserRolesWithPermissions(user.id),
    db.query.auditLogs.findMany({
      columns: {
        action: true,
        createdAt: true,
        entityId: true,
        entityType: true,
        id: true,
      },
      limit: 8,
      orderBy: [desc(auditLogs.createdAt)],
      where: and(
        eq(auditLogs.actorUserId, user.id),
        inArray(auditLogs.action, [...ADMIN_PROFILE_AUDIT_ACTIONS]),
      ),
    }),
    db.select({ value: count() }).from(users).where(isNull(users.deletedAt)),
    db.$count(memberships, eq(memberships.status, 'ACTIVE')),
    db.$count(businesses, and(isNull(businesses.deletedAt), eq(businesses.status, 'PENDING'))),
    db.$count(introductions, inArray(introductions.status, ['SUBMITTED', 'UNDER_REVIEW'])),
    isSuperAdmin(user.id),
  ]);

  const activeTab: ProfileTab =
    userIsSuperAdmin && (tab === 'staff' || tab === 'roles') ? (tab as ProfileTab) : 'profile';

  const profile = user.profile;
  const profileComplete = Boolean(user.displayName && profile?.countryId && profile?.cityId);
  const mergedPermissions = mergeRolePermissions(ownRoles.flatMap((role) => role.permissions));
  const currentPermissions = await getCurrentUserPermissions();

  const profileLabels = {
    avatarHint: dashboardT('avatarHint'),
    bio: dashboardT('bio'),
    bioHint: dashboardT('bioHint'),
    cancelEdit: dashboardT('cancelEdit'),
    city: dashboardT('city'),
    country: dashboardT('country'),
    displayName: dashboardT('displayName'),
    displayNameHint: dashboardT('displayNameHint'),
    editProfile: dashboardT('editProfile'),
    email: dashboardT('email'),
    emailHint: dashboardT('emailHint'),
    notSet: dashboardT('notSet'),
    optional: dashboardT('optional'),
    phone: dashboardT('phone'),
    phoneReadOnly: dashboardT('phoneReadOnly'),
    profileAvatarError: dashboardT('profileAvatarError'),
    profileDescription: dashboardT('profileDescription'),
    profileEmailInUse: dashboardT('profileEmailInUse'),
    profileFormError: dashboardT('profileFormError'),
    profilePicture: dashboardT('profilePicture'),
    profileTitle: dashboardT('profileTitle'),
    saveProfile: dashboardT('saveProfile'),
    uploadAvatar: dashboardT('uploadAvatar'),
    userId: dashboardT('userId'),
    userIdCopied: dashboardT('userIdCopied'),
    userIdCopy: dashboardT('userIdCopy'),
    userIdHint: dashboardT('userIdHint'),
  };

  const metrics = [
    {
      icon: <UserRound className="size-4" />,
      label: adminT('adminProfileMetricUsers'),
      value: totalUsers[0]?.value ?? 0,
    },
    {
      icon: <BadgeCheck className="size-4" />,
      label: adminT('adminProfileMetricMemberships'),
      tone: 'success' as const,
      value: activeMemberships,
    },
    {
      icon: <ClipboardList className="size-4" />,
      label: adminT('adminProfileMetricBusinesses'),
      tone: pendingBusinesses > 0 ? ('warning' as const) : undefined,
      value: pendingBusinesses,
    },
    {
      icon: <Activity className="size-4" />,
      label: adminT('adminProfileMetricIntroductions'),
      tone: pendingIntroductions > 0 ? ('warning' as const) : undefined,
      value: pendingIntroductions,
    },
  ];

  const staffData = userIsSuperAdmin ? await getStaffData() : null;
  const roleData = userIsSuperAdmin ? await getRoleBuilderData() : null;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={localizeHref(locale, '/admin')}>{adminT('goToAdminDashboard')}</Link>
            </Button>
            {userIsSuperAdmin ? (
              <Button asChild size="sm">
                <Link href={localizeHref(locale, '/admin/access')}>{adminT('navAccess')}</Link>
              </Button>
            ) : null}
          </div>
        }
        description={userIsSuperAdmin ? 'Personal admin settings, staff access control, and role construction.' : adminT('adminProfileDescription')}
        eyebrow={userIsSuperAdmin ? adminT('adminRole') : undefined}
        title={userIsSuperAdmin ? 'Super Admin Control Center' : adminT('adminProfileTitle')}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <AdminMetricCard
            icon={metric.icon}
            key={metric.label}
            label={metric.label}
            meta={adminT('liveDatabaseSnapshot')}
            tone={metric.tone}
            value={metric.value}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <TabLink active={activeTab === 'profile'} href={localizeHref(locale, '/admin/profile')} label="My profile" />
        {userIsSuperAdmin ? (
          <>
            <TabLink active={activeTab === 'staff'} href={`${localizeHref(locale, '/admin/profile')}?tab=staff`} label="Staff" />
            <TabLink active={activeTab === 'roles'} href={`${localizeHref(locale, '/admin/profile')}?tab=roles`} label="Role constructor" />
          </>
        ) : null}
      </div>

      {activeTab === 'profile' ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
            <AdminPanel
              description={adminT('adminProfileSettingsDescription')}
              title={adminT('adminProfileSettingsTitle')}
            >
              <DashboardProfileSettingsForm
                avatarUrl={profile?.avatarUrl ?? null}
                bio={profile?.bio ?? null}
                cities={cities.map((city) => ({ id: city.id, label: city.name }))}
                cityId={profile?.cityId ?? null}
                cityName={profile?.city?.name ?? null}
                countries={countries.map((country) => ({ id: country.id, label: country.name }))}
                countryId={profile?.countryId ?? null}
                countryName={profile?.country?.name ?? null}
                displayName={user.displayName}
                email={user.email}
                labels={profileLabels}
                locale={locale}
                phone={user.phone}
                userId={user.id}
              />
            </AdminPanel>

            <div className="space-y-4">
              <AdminPanel description={adminT('adminProfileIdentityDescription')} title={adminT('adminProfileIdentityTitle')}>
                <AdminDescriptionList
                  items={[
                    { label: adminT('name'), value: user.displayName?.trim() || 'Not set' },
                    { label: adminT('phone'), value: user.phone },
                    { label: adminT('email'), value: user.email ?? adminT('notDefined') },
                    { label: adminT('accountStatus'), value: <AdminStatusBadge>{user.status}</AdminStatusBadge> },
                    {
                      label: adminT('adminProfileCompleteness'),
                      value: (
                        <AdminStatusBadge tone={profileComplete ? 'success' : 'warning'}>
                          {profileComplete ? adminT('adminProfileComplete') : adminT('adminProfilePartial')}
                        </AdminStatusBadge>
                      ),
                    },
                  ]}
                />
              </AdminPanel>

              <AdminPanel description={adminT('adminProfileAccessDescription')} title={adminT('adminProfileAccessTitle')}>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {ownRoles.length === 0 ? (
                      <span className="text-sm text-ds-text-muted">{adminT('notDefined')}</span>
                    ) : (
                      ownRoles.map((role) => (
                        <AdminStatusBadge key={role.id} tone="info">
                          {role.name}
                        </AdminStatusBadge>
                      ))
                    )}
                  </div>

                  <div className="space-y-2">
                    {mergedPermissions.length === 0 ? (
                      <p className="text-sm text-ds-text-muted">{adminT('adminProfileNoPermissions')}</p>
                    ) : (
                      mergedPermissions.map((permission) => (
                        <div
                          className="flex items-center justify-between gap-3 rounded-md border border-ds-border bg-ds-bg/40 px-3 py-2 text-sm"
                          key={permission.resource}
                        >
                          <span className="font-medium text-ds-text">{permission.resource}</span>
                          <span className="text-right text-xs text-ds-text-muted">
                            {summarizePermissionRows([permission]).replace(`${permission.resource}: `, '')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {currentPermissions.overrides?.filter((override) => override.denyView || override.denyCreate || override.denyEdit || override.denyDelete).length ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-ds-text">Personal restrictions</p>
                      {currentPermissions.overrides
                        .filter((override) => override.denyView || override.denyCreate || override.denyEdit || override.denyDelete)
                        .map((override) => (
                          <div
                            className="flex items-center justify-between gap-3 rounded-md border border-ds-border bg-ds-bg/40 px-3 py-2 text-sm"
                            key={override.resource}
                          >
                            <span className="font-medium text-ds-text">{override.resource}</span>
                            <span className="text-right text-xs text-ds-text-muted">
                              {summarizeOverride(override)}
                            </span>
                          </div>
                        ))}
                    </div>
                  ) : null}
                </div>
              </AdminPanel>

              <AdminPanel description={adminT('adminProfileManagementDescription')} title={adminT('adminProfileManagementTitle')}>
                <div className="grid gap-2">
                  <QuickLink href={localizeHref(locale, '/admin/users')} icon={<UserRound className="size-4" />} label={adminT('navUsers')} />
                  <QuickLink href={localizeHref(locale, '/admin/audit')} icon={<Database className="size-4" />} label={adminT('navAudit')} />
                  {userIsSuperAdmin ? (
                    <QuickLink href={localizeHref(locale, '/admin/access')} icon={<ShieldCheck className="size-4" />} label={adminT('navAccess')} />
                  ) : null}
                </div>
              </AdminPanel>
            </div>
          </div>

          <AdminPanel description={adminT('adminProfileActivityDescription')} title={adminT('adminProfileActivityTitle')}>
            {ownAuditLogs.length === 0 ? (
              <p className="text-sm text-ds-text-muted">{adminT('noAuditLogs')}</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {ownAuditLogs.map((log) => (
                  <div className="rounded-md border border-ds-border bg-ds-bg/40 px-3 py-2" key={log.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminStatusBadge tone="info">{log.action}</AdminStatusBadge>
                      <span className="text-xs text-ds-text-muted">{log.createdAt.toLocaleString('en-US')}</span>
                    </div>
                    <p className="mt-1 text-xs text-ds-text-muted">
                      {log.entityType ?? 'N/A'} {log.entityId ? `· ${log.entityId}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </AdminPanel>
        </>
      ) : null}

      {activeTab === 'staff' && staffData ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
          <AdminPanel description="All internal accounts except members. Open any user to inspect RBAC roles, restrictions, and effective access." title="Staff Directory">
            <div className="space-y-3">
              {staffData.staff.length === 0 ? (
                <p className="text-sm text-ds-text-muted">No internal staff found.</p>
              ) : (
                staffData.staff.map((staffUser) => (
                  <div className="flex flex-col gap-3 rounded-md border border-ds-border bg-ds-bg/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" key={staffUser.id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ds-text">{staffUser.displayName?.trim() || 'Not set'}</p>
                      <p className="truncate text-xs text-ds-text-muted">{staffUser.phone}</p>
                      {staffUser.email ? <p className="truncate text-xs text-ds-text-muted">{staffUser.email}</p> : null}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <AdminStatusBadge>{staffUser.status}</AdminStatusBadge>
                        {staffUser.roles.length === 0 ? (
                          <AdminStatusBadge>RBAC: none</AdminStatusBadge>
                        ) : (
                          staffUser.roles.map((role) => (
                            <AdminStatusBadge key={role.id} tone="info">
                              {role.name}
                            </AdminStatusBadge>
                          ))
                        )}
                        {staffUser.overrideCount > 0 ? (
                          <AdminStatusBadge tone="warning">{staffUser.overrideCount} restrictions</AdminStatusBadge>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={localizeHref(locale, `/admin/users/${staffUser.id}`)}>Manage access</Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </AdminPanel>

          <AdminPanel description="Use the user detail access tab to assign RBAC roles, inspect effective permissions, and edit per-user restrictions." title="Staff Actions">
            <div className="grid gap-2">
              <QuickLink href={localizeHref(locale, '/admin/users')} icon={<UserRound className="size-4" />} label="Open users directory" />
              <QuickLink href={localizeHref(locale, '/admin/access')} icon={<ShieldCheck className="size-4" />} label="Open access overview" />
              <QuickLink href={`${localizeHref(locale, '/admin/profile')}?tab=roles`} icon={<BadgeCheck className="size-4" />} label="Open role constructor" />
            </div>
          </AdminPanel>
        </div>
      ) : null}

      {activeTab === 'roles' && roleData ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <AdminPanel description="Create a new RBAC role. After creation, open the role detail page to configure permissions and assignments." title="Create role">
            <RoleForm locale={locale} />
          </AdminPanel>

          <div className="space-y-4">
            <AdminPanel description="Existing roles, assignment counts, and direct links into permission editing." title="Roles">
              <div className="space-y-3">
                {roleData.roles.map((role) => (
                  <div className="flex flex-col gap-3 rounded-md border border-ds-border bg-ds-bg/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" key={role.id}>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-ds-text">{role.name}</p>
                        {role.isSystem ? <AdminStatusBadge tone="info">System</AdminStatusBadge> : null}
                      </div>
                      <p className="truncate text-xs text-ds-text-muted">{role.slug}</p>
                      <p className="mt-1 text-xs text-ds-text-muted">{role.description ?? 'No description'}</p>
                      <p className="mt-2 text-xs text-ds-text-muted">
                        {role.assignmentCount} users · {role.permissionCount} configured resources
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={localizeHref(locale, `/admin/roles/${role.id}`)}>Open role</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel description="The access overview remains available for matrix-level review across all roles and users." title="Access overview">
              <QuickLink href={localizeHref(locale, '/admin/access')} icon={<ShieldCheck className="size-4" />} label="Open access overview" />
            </AdminPanel>
          </div>
        </div>
      ) : null}
    </div>
  );
}

async function getStaffData() {
  const [staff, overrideCounts] = await Promise.all([
    db.query.users.findMany({
      columns: {
        displayName: true,
        email: true,
        id: true,
        phone: true,
        role: true,
        status: true,
      },
      orderBy: [desc(users.updatedAt)],
      where: and(isNull(users.deletedAt), eq(users.status, 'ACTIVE'), inArray(users.role, ['MANAGER', 'ADMIN', 'OWNER'])),
      with: {
        roleAssignments: {
          with: {
            role: {
              columns: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
    db
      .select({
        count: count(),
        userId: userPermissionOverrides.userId,
      })
      .from(userPermissionOverrides)
      .groupBy(userPermissionOverrides.userId),
  ]);

  const overrideCountMap = new Map(overrideCounts.map((row) => [row.userId, row.count]));

  return {
    staff: staff.map((staffUser) => ({
      ...staffUser,
      roles: staffUser.roleAssignments.map((assignment) => assignment.role),
      overrideCount: overrideCountMap.get(staffUser.id) ?? 0,
    })),
  };
}

async function getRoleBuilderData() {
  const roleRows = await db.query.roles.findMany({
    orderBy: [desc(roles.createdAt)],
    where: isNull(roles.deletedAt),
    with: {
      permissions: {
        columns: {
          id: true,
        },
      },
      userAssignments: {
        columns: {
          id: true,
        },
      },
    },
  });

  return {
    roles: roleRows.map((role) => ({
      ...role,
      assignmentCount: role.userAssignments.length,
      permissionCount: role.permissions.length,
    })),
  };
}

function QuickLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <Button asChild className="justify-start" variant="outline">
      <Link href={href}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}

function TabLink({ active, href, label }: { active: boolean; href: string; label: string }) {
  return (
    <Button asChild size="sm" variant={active ? 'default' : 'outline'}>
      <Link href={href}>{label}</Link>
    </Button>
  );
}

function summarizeOverride(override: {
  denyView: boolean;
  denyCreate: boolean;
  denyEdit: boolean;
  denyDelete: boolean;
}) {
  const actions = [
    override.denyView ? 'view' : null,
    override.denyCreate ? 'create' : null,
    override.denyEdit ? 'edit' : null,
    override.denyDelete ? 'delete' : null,
  ].filter(Boolean);

  return actions.length > 0 ? actions.map((action) => `deny ${action}`).join(' / ') : 'none';
}

function mergeRolePermissions(
  rows: Array<{
    canCreate: boolean;
    canDelete: boolean;
    canEdit: boolean;
    canView: boolean;
    resource: Resource;
  }>,
) {
  const merged = new Map<
    Resource,
    {
      canCreate: boolean;
      canDelete: boolean;
      canEdit: boolean;
      canView: boolean;
      resource: Resource;
    }
  >();

  rows.forEach((row) => {
    const existing = merged.get(row.resource) ?? {
      canCreate: false,
      canDelete: false,
      canEdit: false,
      canView: false,
      resource: row.resource,
    };

    existing.canView = existing.canView || row.canView;
    existing.canCreate = existing.canCreate || row.canCreate;
    existing.canEdit = existing.canEdit || row.canEdit;
    existing.canDelete = existing.canDelete || row.canDelete;
    merged.set(row.resource, existing);
  });

  return Array.from(merged.values()).filter(
    (row) => row.canView || row.canCreate || row.canEdit || row.canDelete,
  );
}
