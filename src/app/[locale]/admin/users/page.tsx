import { Activity, Filter, UserPlus, Users } from 'lucide-react';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AdminTableActionsCell,
  AdminTableActionsHead,
} from '@/features/admin/components/admin-table-actions';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminMetricCard,
  AdminMobileCard,
  AdminPageHeader,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { UserRowActions } from '@/features/admin/components/user-row-actions';
import { UsersFilters } from '@/features/admin/components/users-filters';
import {
  UsersListPagination,
} from '@/features/admin/components/users-list-pagination';
import { UsersPageActions } from '@/features/admin/components/users-page-actions';
import {
  fetchAdminUsers,
  filterAdminUsers,
  formatAdminUserMembership,
} from '@/features/admin/lib/users-list';
import {
  parseUsersPageNumber,
  parseUsersPageSize,
} from '@/features/admin/lib/users-list-pagination';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminUsersPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    plan?: string;
    q?: string;
    status?: string;
  }>;
}

function formatDate(d: Date): string {
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function avatarUrl(name: string): string {
  return `https://avatar.vercel.sh/${encodeURIComponent(name)}`;
}

export default async function AdminUsersPage({ params, searchParams }: AdminUsersPageProps) {
  const { locale } = await params;
  const { page: pageParam, pageSize: pageSizeParam, plan, q, status } = await searchParams;

  const t = getT('admin', locale);

  const searchTerm = q?.trim() ?? '';
  const planFilter = plan?.trim() ?? '';
  const statusFilter = status?.trim() ?? '';

  const allUsers = await fetchAdminUsers();

  const filtered = filterAdminUsers(allUsers, {
    plan: planFilter,
    q: searchTerm,
    status: statusFilter,
  });

  const totalCount = allUsers.length;
  const filteredCount = filtered.length;
  const activeCount = allUsers.filter((u) => u.status === 'ACTIVE').length;
  const newUsersCount = allUsers.filter(
    (user) => user.createdAt.getTime() >= Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).length;

  const pageSize = parseUsersPageSize(pageSizeParam);
  const requestedPage = parseUsersPageNumber(pageParam);
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const pageStart = (page - 1) * pageSize;
  const pageUsers = filtered.slice(pageStart, pageStart + pageSize);
  const startRow = filteredCount === 0 ? 0 : pageStart + 1;
  const endRow = Math.min(pageStart + pageSize, filteredCount);
  const usersBasePath = localizeHref(locale, '/admin/users');

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        description={`${totalCount.toLocaleString()} total users - ${activeCount.toLocaleString()} active accounts`}
        title={t('usersTitle')}
        actions={
          <UsersPageActions
            addUserLabel={t('addUser')}
            exportLabel={t('export')}
            importLabels={{
              cancel: t('cancel'),
              close: t('close'),
              emptyValue: t('emptyValue'),
              importConfirm: t('importConfirm'),
              importDropzone: t('importDropzone'),
              importEmpty: t('importEmpty'),
              importErrorColumn: t('importErrorColumn'),
              importErrors: t('importErrors'),
              importInvalidFile: t('importInvalidFile'),
              importMoreRows: t('importMoreRows'),
              importPartialSuccess: t('importPartialSuccess'),
              importPreview: t('importPreview'),
              importRowNumber: t('importRowNumber'),
              importRowError: t('importRowError'),
              importSelectedRows: t('importSelectedRows'),
              importSuccess: t('importSuccess'),
              importTooManyRows: t('importTooManyRows'),
              importUsers: t('importUsers'),
              importUsersDescription: t('importUsersDescription'),
              importUsersTitle: t('importUsersTitle'),
              importing: t('importing'),
              phone: t('phone'),
            }}
            locale={locale}
            planFilter={planFilter}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminMetricCard
          icon={<Users className="size-4" />}
          label={t('statUsers')}
          value={totalCount}
        />
        <AdminMetricCard
          icon={<Activity className="size-4" />}
          label={t('usersMetricActive')}
          tone="success"
          value={activeCount}
        />
        <AdminMetricCard
          icon={<UserPlus className="size-4" />}
          label={t('usersMetricNew')}
          value={newUsersCount}
        />
      </div>

      <div className="flex items-center gap-2 text-ds-text-sm font-medium text-ds-text">
        <Filter aria-hidden="true" className="size-4 text-ds-text-muted" />
        {t('usersDirectory')}
        <span className="text-ds-text-muted">({filteredCount.toLocaleString()})</span>
      </div>

      <UsersFilters
        searchTerm={searchTerm}
        labels={{
          allPlans: t('allPlans'),
          allStatuses: t('allStatuses'),
          membership: t('membership'),
          search: t('search'),
          searchPlaceholder: t('searchPlaceholder'),
          status: t('status'),
        }}
        planFilter={planFilter}
        statusFilter={statusFilter}
        basePath={localizeHref(locale, '/admin/users')}
      />

      {filteredCount === 0 ? (
        <AdminEmptyState title={t('noUsers')} />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="space-y-3 md:hidden">
            {pageUsers.map((user) => (
              <AdminMobileCard
                key={user.id}
                title={
                  <span className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarImage src={avatarUrl(user.displayName ?? user.phone)} />
                      <AvatarFallback className="rounded-full bg-muted text-[10px] text-muted-foreground">
                        {user.displayName?.charAt(0) ?? user.phone.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {user.displayName ?? t('notDefined')}
                  </span>
                }
                subtitle={user.phone}
                badge={
                  <div className="flex gap-1">
                    <AdminStatusBadge>{formatAdminUserMembership(user, t('notDefined'))}</AdminStatusBadge>
                    <AdminStatusBadge>{user.status}</AdminStatusBadge>
                  </div>
                }
                href={localizeHref(locale, `/admin/users/${user.id}`)}
                rows={[
                  { label: t('country'), value: user.country ?? t('notDefined') },
                  {
                    label: t('joined'),
                    value: formatDate(user.createdAt),
                  },
                ]}
              />
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block">
            <AdminDataTableShell>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 pl-4">
                      <Checkbox />
                    </TableHead>
                    <TableHead>{t('user')}</TableHead>
                    <TableHead>{t('membership')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('country')}</TableHead>
                    <TableHead>{t('joined')}</TableHead>
                    <AdminTableActionsHead label={t('actions')} />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="pl-4">
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarImage src={avatarUrl(user.displayName ?? user.phone)} />
                            <AvatarFallback className="rounded-full bg-muted text-xs text-muted-foreground">
                              {user.displayName?.charAt(0) ?? user.phone.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-foreground">{user.displayName ?? t('notDefined')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge>{formatAdminUserMembership(user, t('notDefined'))}</AdminStatusBadge>
                      </TableCell>
                      <TableCell>
                        <AdminStatusBadge>{user.status}</AdminStatusBadge>
                      </TableCell>
                      <TableCell className="text-ds-text-muted">{user.country ?? t('notDefined')}</TableCell>
                      <TableCell className="text-ds-text-muted">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <AdminTableActionsCell>
                        <UserRowActions
                          actionLabel={t('actions')}
                          deleteLabel={t('block')}
                          editLabel={t('edit')}
                          userId={user.id}
                          viewHref={localizeHref(locale, `/admin/users/${user.id}`)}
                          viewLabel={t('view')}
                        />
                      </AdminTableActionsCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminDataTableShell>
          </div>
        </>
      )}

      {totalPages > 1 ? (
        <UsersListPagination
          basePath={usersBasePath}
          endRow={endRow}
          filteredCount={filteredCount}
          labels={{
            firstPage: t('paginationFirst'),
            lastPage: t('paginationLast'),
            paginationNext: t('paginationNext'),
            paginationPrev: t('paginationPrev'),
            rowsPerPage: t('rowsPerPage'),
            showingRows: t('showingRows'),
          }}
          page={page}
          pageSize={pageSize}
          planFilter={planFilter}
          searchTerm={searchTerm}
          startRow={startRow}
          statusFilter={statusFilter}
          totalPages={totalPages}
        />
      ) : null}
    </div>
  );
}
