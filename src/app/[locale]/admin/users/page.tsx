import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

import { localizeHref, type SupportedLocale } from '@/components/layout/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { db } from '@/db/client';
import {
  AdminDataTableShell,
  AdminEmptyState,
  AdminPageHeader,
  AdminStatusBadge,
} from '@/features/admin/components/admin-ui';
import { UsersFilters } from '@/features/admin/components/users-filters';
import { getT } from '@/lib/i18n/t-server';

export const dynamic = 'force-dynamic';

interface AdminUsersPageProps {
  params: Promise<{
    locale: SupportedLocale;
  }>;
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
  }>;
}

const PAGE_SIZE = 10;

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default async function AdminUsersPage({ params, searchParams }: AdminUsersPageProps) {
  const { locale } = await params;
  const { q, role, status } = await searchParams;

  const t = getT('admin', locale);

  const searchTerm = q?.trim() ?? '';
  const roleFilter = role?.trim() ?? '';
  const statusFilter = status?.trim() ?? '';

  const allUsers = await db.query.users.findMany({
    columns: {
      id: true,
      displayName: true,
      phone: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });

  let filtered = allUsers;

  if (searchTerm) {
    filtered = filtered.filter(
      (u) =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  if (roleFilter) {
    filtered = filtered.filter((u) => u.role === roleFilter);
  }

  if (statusFilter) {
    filtered = filtered.filter((u) => u.status === statusFilter);
  }

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
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 border-0 bg-card text-foreground"
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button
              size="sm"
              className="h-9 gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Add User</span>
            </Button>
          </>
        }
      />

      <UsersFilters
        searchTerm={searchTerm}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        basePath={localizeHref(locale, '/admin/users')}
      />

      {filteredCount === 0 ? (
        <AdminEmptyState title={t('noUsers')} />
      ) : (
        <AdminDataTableShell>
          <Table>
            <TableHeader>
              <TableRow className="border-0 bg-card">
                <TableHead className="w-10 pl-4">
                  <Checkbox />
                </TableHead>
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Role</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Joined</TableHead>
                <TableHead className="pr-4 text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageUsers.map((user) => (
                <TableRow key={user.id} className="border-border">
                  <TableCell className="pl-4">
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarFallback className="rounded-full bg-muted text-xs text-muted-foreground">
                          {getInitials(user.displayName ?? user.phone)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">{user.displayName ?? '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email ?? '—'}</TableCell>
                  <TableCell>
                    <AdminStatusBadge>{user.role}</AdminStatusBadge>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge>{user.status}</AdminStatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.createdAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button variant="ghost" size="icon" className="size-8 text-foreground" asChild>
                      <Link href={localizeHref(locale, `/admin/users/${user.id}`)}>
                        <MoreHorizontal className="size-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminDataTableShell>
      )}

      {filteredCount > PAGE_SIZE ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startRow}&ndash;{endRow} of {filteredCount.toLocaleString()} users
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">Rows per page</span>
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
            <div className="flex items-center gap-1">
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
