import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  AdminMobileCard,
  AdminPageHeader,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { UserRowActions } from '@/features/admin/components/user-row-actions';
import { UsersFilters } from '@/features/admin/components/users-filters';
import { UsersPageActions } from '@/features/admin/components/users-page-actions';
import {
  fetchAdminUsers,
  filterAdminUsers,
  formatAdminUserMembership,
} from '@/features/admin/lib/users-list';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminUsersPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    q?: string;
    plan?: string;
    status?: string;
  }>;
}

const PAGE_SIZE = 10;

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
  const { q, plan, status } = await searchParams;

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

  const page = 1; // TODO: add page param
  const totalPages = Math.ceil(filteredCount / PAGE_SIZE);
  const pageUsers = filtered.slice(0, PAGE_SIZE);
  const startRow = 1;
  const endRow = Math.min(PAGE_SIZE, filteredCount);

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
              importConfirm: t('importConfirm'),
              importDropzone: t('importDropzone'),
              importEmpty: t('importEmpty'),
              importErrors: t('importErrors'),
              importInvalidFile: t('importInvalidFile'),
              importPartialSuccess: t('importPartialSuccess'),
              importPreview: t('importPreview'),
              importRowError: t('importRowError'),
              importSelectedRows: t('importSelectedRows'),
              importSuccess: t('importSuccess'),
              importTooManyRows: t('importTooManyRows'),
              importUsers: t('importUsers'),
              importUsersDescription: t('importUsersDescription'),
              importUsersTitle: t('importUsersTitle'),
              importing: t('importing'),
            }}
            locale={locale}
            planFilter={planFilter}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
          />
        }
      />

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

      {filteredCount > PAGE_SIZE ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {t('showingRows')
              .replace('{start}', String(startRow))
              .replace('{end}', String(endRow))
              .replace('{count}', filteredCount.toLocaleString())}
          </p>
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Mobile simple pagination */}
            <div className="flex items-center gap-2 sm:hidden">
              <Button variant="outline" size="sm" className="h-8" disabled>
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
              <Button variant="outline" size="sm" className="h-8">
                Next
              </Button>
            </div>

            {/* Desktop complex pagination */}
            <div className="hidden sm:flex items-center gap-2">
              <Select defaultValue="10">
                <SelectTrigger className="h-8 w-16 border-0 bg-card text-foreground">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8 border-0 bg-card text-foreground"
                disabled
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 border-0 bg-card text-foreground"
                disabled
              >
                <ChevronLeft className="size-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  size="icon"
                  className={`size-8 ${p === page ? 'bg-foreground text-background hover:bg-foreground/90' : 'border-0 bg-card text-foreground'}`}
                  variant={p === page ? 'default' : 'outline'}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="size-8 border-0 bg-card text-foreground"
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8 border-0 bg-card text-foreground"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
