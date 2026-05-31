import 'server-only';

import { desc, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { users } from '@/db/schema';

export type AdminUserListItem = {
  createdAt: Date;
  displayName: string | null;
  email: string | null;
  id: string;
  memberships: { planCode: string; status: string }[] | null;
  phone: string;
  role: string;
  status: string;
};

export interface UsersListFilters {
  plan?: string;
  q?: string;
  status?: string;
}

export async function fetchAdminUsers(): Promise<AdminUserListItem[]> {
  return db.query.users.findMany({
    columns: {
      createdAt: true,
      displayName: true,
      email: true,
      id: true,
      phone: true,
      role: true,
      status: true,
    },
    orderBy: [desc(users.createdAt)],
    where: isNull(users.deletedAt),
    with: {
      memberships: {
        columns: {
          planCode: true,
          status: true,
        },
      },
    },
  });
}

export function filterAdminUsers(
  allUsers: AdminUserListItem[],
  filters: UsersListFilters,
): AdminUserListItem[] {
  const searchTerm = filters.q?.trim() ?? '';
  const planFilter = filters.plan?.trim() ?? '';
  const statusFilter = filters.status?.trim() ?? '';

  let filtered = allUsers;

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (user) =>
        user.displayName?.toLowerCase().includes(lower) ||
        user.phone.includes(searchTerm) ||
        user.email?.toLowerCase().includes(lower),
    );
  }

  if (planFilter) {
    filtered = filtered.filter((user) =>
      user.memberships?.some((membership) => membership.status === 'ACTIVE' && membership.planCode === planFilter),
    );
  }

  if (statusFilter) {
    filtered = filtered.filter((user) => user.status === statusFilter);
  }

  return filtered;
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function formatMembership(user: AdminUserListItem): string {
  return user.memberships?.find((membership) => membership.status === 'ACTIVE')?.planCode ?? '';
}

export function usersToCsv(rows: AdminUserListItem[]): string {
  const header = ['ID', 'Display Name', 'Phone', 'Email', 'Role', 'Status', 'Membership', 'Joined'];
  const lines = [
    header.join(','),
    ...rows.map((user) =>
      [
        user.id,
        user.displayName ?? '',
        user.phone,
        user.email ?? '',
        user.role,
        user.status,
        formatMembership(user),
        user.createdAt.toISOString(),
      ]
        .map((value) => escapeCsvField(value))
        .join(','),
    ),
  ];

  return `${lines.join('\r\n')}\r\n`;
}
