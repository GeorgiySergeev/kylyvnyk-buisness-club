import 'server-only';

import { and, desc, eq, gte, ilike, isNull, or } from 'drizzle-orm';

import { db } from '@/db/client';
import { users } from '@/db/schema';
import type { UserStatus } from '@/db/schema/enums/user-status';
import { resolveEffectiveMembership } from '@/features/billing/lib/membership-resolver';

export type AdminUserListItem = {
  createdAt: Date;
  displayName: string | null;
  email: string | null;
  id: string;
  memberships: { createdAt: Date; planCode: string; status: string; updatedAt: Date }[] | null;
  phone: string;
  role: string;
  status: string;
  country: string | null;
};

export interface UsersListFilters {
  plan?: string;
  q?: string;
  status?: string;
}

type AdminUsersQueryOptions = {
  limit?: number;
  offset?: number;
};

function normalizeUsersFilters(filters: UsersListFilters): Required<Pick<UsersListFilters, 'q' | 'status'>> {
  return {
    q: filters.q?.trim() ?? '',
    status: filters.status?.trim() ?? '',
  };
}

function buildUsersWhereClause(filters: UsersListFilters) {
  const normalized = normalizeUsersFilters(filters);
  const conditions = [isNull(users.deletedAt)] as ReturnType<typeof eq>[];

  if (normalized.status) {
    conditions.push(eq(users.status, normalized.status as UserStatus));
  }

  if (normalized.q) {
    const pattern = `%${normalized.q}%`;
    const searchCondition = or(
      ilike(users.displayName, pattern),
      ilike(users.phone, pattern),
      ilike(users.email, pattern),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  return and(...conditions);
}

export async function fetchAdminUsers(
  filters: UsersListFilters = {},
  options: AdminUsersQueryOptions = {},
): Promise<AdminUserListItem[]> {
  const rows = await db.query.users.findMany({
    columns: {
      createdAt: true,
      displayName: true,
      email: true,
      id: true,
      phone: true,
      role: true,
      status: true,
    },
    limit: options.limit,
    offset: options.offset,
    orderBy: [desc(users.createdAt)],
    where: buildUsersWhereClause(filters),
    with: {
      memberships: {
        columns: {
          createdAt: true,
          planCode: true,
          status: true,
          updatedAt: true,
        },
      },
      profile: {
        columns: {},
        with: {
          country: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
  });

  return rows.map((row) => {
    const { profile, ...rest } = row;
    return {
      ...rest,
      country: profile?.country?.name ?? null,
    };
  });
}

export async function countAdminUsers(filters: UsersListFilters = {}): Promise<number> {
  return db.$count(users, buildUsersWhereClause(filters));
}

export async function countRecentAdminUsers(since: Date): Promise<number> {
  return db.$count(users, and(isNull(users.deletedAt), gte(users.createdAt, since)));
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
    filtered = filtered.filter((user) => resolveEffectiveMembership(user.memberships)?.planCode === planFilter);
  }

  if (statusFilter) {
    filtered = filtered.filter((user) => user.status === statusFilter);
  }

  return filtered;
}

function escapeCsvField(value: string): string {
  const sanitized = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

  if (
    sanitized.includes(',') ||
    sanitized.includes('"') ||
    sanitized.includes('\n') ||
    sanitized.includes('\r')
  ) {
    return `"${sanitized.replace(/"/g, '""')}"`;
  }

  return sanitized;
}

export function formatAdminUserMembership(user: AdminUserListItem, fallback = ''): string {
  return resolveEffectiveMembership(user.memberships)?.planCode ?? fallback;
}

export function usersToCsv(rows: AdminUserListItem[]): string {
  const header = ['ID', 'Display Name', 'Phone', 'Email', 'Role', 'Status', 'Membership', 'Country', 'Joined'];
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
        formatAdminUserMembership(user),
        user.country ?? '',
        user.createdAt.toISOString(),
      ]
        .map((value) => escapeCsvField(value))
        .join(','),
    ),
  ];

  return `${lines.join('\r\n')}\r\n`;
}
