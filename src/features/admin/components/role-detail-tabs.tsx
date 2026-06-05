'use client';

import { ClipboardList, KeyRound, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import type { SupportedLocale } from '@/components/layout/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { roles as rolesTable } from '@/db/schema';
import type { Resource } from '@/db/schema/permission';
import { AdminDetailPageHeader } from '@/features/admin/components/admin-detail-page-header';
import { type AdminDetailTabItem, AdminDetailTabNav } from '@/features/admin/components/admin-detail-tab-nav';
import {
  AdminTableActionsCell,
  AdminTableActionsHead,
  AdminTableNavigateAction,
} from '@/features/admin/components/admin-table-actions';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminMobileCard,
  AdminPanel,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { getInitials } from '@/features/profile/components/dashboard-profile-shared';
import { RoleForm } from '@/features/roles/components/role-form';
import { RolePermissionEditor } from '@/features/roles/components/role-permission-editor';

type Role = typeof rolesTable.$inferSelect;

type RoleTabKey = 'edit' | 'permissions' | 'users' | 'activity';

interface RolePermissionRow {
  canCreate: boolean;
  canDelete: boolean;
  canEdit: boolean;
  canView: boolean;
  resource: Resource;
}

export interface RoleAssignedUserRow {
  assignedAt: string;
  assignedByName: string | null;
  email: string | null;
  id: string;
  isDeleted: boolean;
  name: string;
  phone: string;
  status: string;
  userHref: string;
}

export interface RoleAuditLogRow {
  action: string;
  actorName: string | null;
  createdAt: string;
  entityId: string | null;
  entityType: string | null;
  id: string;
  ipAddress: string | null;
  payloadSummary: string | null;
}

interface RoleDetailTabsProps {
  assignedUsers: RoleAssignedUserRow[];
  auditLogs: RoleAuditLogRow[];
  backHref: string;
  backLabel: string;
  initialPermissions: RolePermissionRow[];
  locale: SupportedLocale;
  permLabels: {
    canCreate: string;
    canDelete: string;
    canEdit: string;
    canView: string;
    resource: string;
  };
  role: Role;
  tabLabels: {
    accountStatus: string;
    actions: string;
    assignedAt: string;
    assignedBy: string;
    auditActor: string;
    edit: string;
    email: string;
    emptyValue: string;
    name: string;
    paginationNext: string;
    paginationPageSummary: string;
    paginationPrev: string;
    permissions: string;
    phone: string;
    roleActivityDescription: string;
    roleNoActivity: string;
    roleNoAssignedUsers: string;
    roleNoAssignedUsersDescription: string;
    roleSystemLabel: string;
    roleTabActivity: string;
    roleTabUsers: string;
    roleUsersDescription: string;
    status: string;
    view: string;
  };
}

export function RoleDetailTabs({
  assignedUsers,
  auditLogs,
  backHref,
  backLabel,
  initialPermissions,
  locale,
  permLabels,
  role,
  tabLabels,
}: RoleDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<RoleTabKey>('edit');
  const [activityPage, setActivityPage] = useState(1);

  const tabs: AdminDetailTabItem<RoleTabKey>[] = [
    { icon: ShieldCheck, key: 'edit', label: tabLabels.edit },
    { icon: KeyRound, key: 'permissions', label: tabLabels.permissions },
    { icon: Users, key: 'users', label: tabLabels.roleTabUsers },
    { icon: ClipboardList, key: 'activity', label: tabLabels.roleTabActivity },
  ];

  return (
    <div className="flex flex-col gap-8">
      <AdminDetailPageHeader
        backHref={backHref}
        backLabel={backLabel}
        meta={role.isSystem ? tabLabels.roleSystemLabel : undefined}
        subtitle={role.slug}
        title={role.name}
      >
        <AdminDetailTabNav
          activeTab={activeTab}
          ariaLabel="Role sections"
          onChange={setActiveTab}
          tabs={tabs}
        />
      </AdminDetailPageHeader>

      <section className="min-w-0 space-y-6">
        {activeTab === 'edit' ? (
          <AdminPanel title={tabLabels.edit}>
            <RoleForm locale={locale} role={role} />
          </AdminPanel>
        ) : null}

        {activeTab === 'permissions' ? (
          <AdminPanel title={tabLabels.permissions}>
            <RolePermissionEditor
              initialPermissions={initialPermissions}
              labels={permLabels}
              roleId={role.id}
            />
          </AdminPanel>
        ) : null}

        {activeTab === 'users' ? (
          <AdminPanel description={tabLabels.roleUsersDescription} title={tabLabels.roleTabUsers}>
            <RoleAssignedUsersSection labels={tabLabels} users={assignedUsers} />
          </AdminPanel>
        ) : null}

        {activeTab === 'activity' ? (
          <AdminPanel description={tabLabels.roleActivityDescription} title={tabLabels.roleTabActivity}>
            <RoleActivitySection
              actorLabel={tabLabels.auditActor}
              emptyTitle={tabLabels.roleNoActivity}
              labels={tabLabels}
              logs={auditLogs}
              onPageChange={setActivityPage}
              page={activityPage}
            />
          </AdminPanel>
        ) : null}
      </section>
    </div>
  );
}

function RoleAssignedUsersSection({
  labels,
  users,
}: {
  labels: RoleDetailTabsProps['tabLabels'];
  users: RoleAssignedUserRow[];
}) {
  if (users.length === 0) {
    return (
      <AdminEmptyState
        description={labels.roleNoAssignedUsersDescription}
        title={labels.roleNoAssignedUsers}
      />
    );
  }

  return (
    <>
      <div className="hidden lg:block">
        <AdminDataTableShell>
          <Table>
            <TableHeader>
              <TableRow className="border-0 bg-ds-surface-2/70 hover:bg-ds-surface-2/70">
                <TableHead className="text-ds-text-muted">{labels.name}</TableHead>
                <TableHead className="text-ds-text-muted">{labels.phone}</TableHead>
                <TableHead className="text-ds-text-muted">{labels.email}</TableHead>
                <TableHead className="text-ds-text-muted">{labels.accountStatus}</TableHead>
                <TableHead className="text-ds-text-muted">{labels.assignedAt}</TableHead>
                <TableHead className="text-ds-text-muted">{labels.assignedBy}</TableHead>
                <AdminTableActionsHead label={labels.actions} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow className={user.isDeleted ? 'border-ds-border opacity-60' : 'border-ds-border'} key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarFallback className="rounded-full bg-ds-surface-2 text-xs text-ds-text-muted">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-ds-text">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-ds-text-muted">{user.phone}</TableCell>
                  <TableCell className="text-ds-text-muted">{user.email ?? labels.emptyValue}</TableCell>
                  <TableCell>
                    <AdminStatusBadge>{user.status}</AdminStatusBadge>
                  </TableCell>
                  <TableCell className="text-ds-text-muted">{user.assignedAt}</TableCell>
                  <TableCell className="text-ds-text-muted">{user.assignedByName ?? labels.emptyValue}</TableCell>
                  <AdminTableActionsCell>
                    <AdminTableNavigateAction href={user.userHref} label={labels.view} />
                  </AdminTableActionsCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminDataTableShell>
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        {users.map((user) => (
          <AdminMobileCard
            actions={
              <Button asChild className="h-9 w-full" size="sm" variant="outline">
                <Link href={user.userHref}>{labels.view}</Link>
              </Button>
            }
            badge={<AdminStatusBadge>{user.status}</AdminStatusBadge>}
            href={user.userHref}
            key={user.id}
            rows={[
              { label: labels.phone, value: user.phone },
              { label: labels.email, value: user.email ?? labels.emptyValue },
              { label: labels.assignedAt, value: user.assignedAt },
              { label: labels.assignedBy, value: user.assignedByName ?? labels.emptyValue },
            ]}
            subtitle={user.phone}
            title={user.name}
          />
        ))}
      </div>
    </>
  );
}

function RoleActivitySection({
  actorLabel,
  emptyTitle,
  labels,
  logs,
  onPageChange,
  page,
}: {
  actorLabel: string;
  emptyTitle: string;
  labels: RoleDetailTabsProps['tabLabels'];
  logs: RoleAuditLogRow[];
  onPageChange: (page: number) => void;
  page: number;
}) {
  const PAGE_SIZE = 10;
  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const items = logs.slice(start, start + PAGE_SIZE);

  if (logs.length === 0) {
    return <AdminEmptyState title={emptyTitle} />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {items.map((log) => (
          <div className="border-b border-ds-border/40 py-3 last:border-0" key={log.id}>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-ds-text">{log.action}</p>
              {log.payloadSummary ? (
                <span className="text-xs text-ds-text-muted">{log.payloadSummary}</span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-ds-text-muted">
              {log.createdAt}
              {log.actorName ? ` / ${actorLabel}: ${log.actorName}` : ''}
              {log.ipAddress ? ` / ${log.ipAddress}` : ''}
            </p>
          </div>
        ))}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-ds-text-muted">
            {labels.paginationPageSummary
              .replace('{page}', String(currentPage))
              .replace('{total}', String(totalPages))}
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              size="sm"
              type="button"
              variant="outline"
            >
              {labels.paginationPrev}
            </Button>
            <Button
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              size="sm"
              type="button"
              variant="outline"
            >
              {labels.paginationNext}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
