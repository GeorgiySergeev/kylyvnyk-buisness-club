import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/db/client', () => ({
  db: {},
}));

import type { AdminUserListItem } from '../../../src/features/admin/lib/users-list';
import { usersToCsv } from '../../../src/features/admin/lib/users-list';

function createUser(overrides: Partial<AdminUserListItem> = {}): AdminUserListItem {
  return {
    country: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    displayName: 'Test User',
    email: null,
    id: 'user-1',
    memberships: [],
    phone: '+15550000001',
    role: 'MEMBER',
    status: 'ACTIVE',
    ...overrides,
  };
}

describe('usersToCsv', () => {
  it('sanitizes spreadsheet formula prefixes in exported values', () => {
    const csv = usersToCsv([
      createUser({
        displayName: '=HYPERLINK("https://evil.local","click")',
      }),
    ]);

    expect(csv).toContain(`"'=HYPERLINK(""https://evil.local"",""click"")"`);
  });
});
