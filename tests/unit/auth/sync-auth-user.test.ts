import { beforeEach, describe, expect, it, vi } from 'vitest';

const insertMock = vi.fn();
const updateMock = vi.fn();
const ensureFreeMembershipWhenNoActiveVipMock = vi.fn();

vi.mock('server-only', () => ({}));
vi.mock('@/db/client', () => ({
  db: {
    insert: insertMock,
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
    update: updateMock,
  },
}));
vi.mock('@/features/billing/lib/membership-access', () => ({
  ensureFreeMembershipWhenNoActiveVip: ensureFreeMembershipWhenNoActiveVipMock,
}));

describe('syncAuthUser', () => {
  beforeEach(() => {
    vi.resetModules();
    insertMock.mockReset();
    updateMock.mockReset();
    ensureFreeMembershipWhenNoActiveVipMock.mockReset();
  });

  it('treats an existing Supabase identity as not new without timestamp guessing', async () => {
    const existingUser = {
      id: 'user-1',
      phone: '+15550000001',
      supabaseUserId: 'supabase-user-1',
    };
    const insertReturningMock = vi.fn().mockResolvedValue([]);
    const updateReturningMock = vi.fn().mockResolvedValue([existingUser]);
    const profileOnConflictDoNothingMock = vi.fn().mockResolvedValue(undefined);

    insertMock
      .mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          onConflictDoNothing: vi.fn().mockReturnValue({
            returning: insertReturningMock,
          }),
        }),
      })
      .mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          onConflictDoNothing: profileOnConflictDoNothingMock,
        }),
      });
    updateMock.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: updateReturningMock,
        }),
      }),
    });

    const { syncAuthUser } = await import('../../../src/features/auth/lib/sync-auth-user');

    await expect(
      syncAuthUser({
        devBypass: false,
        phone: '+15550000001',
        providerUserId: 'supabase-user-1',
      }),
    ).resolves.toEqual({ isNew: false, user: existingUser });
    expect(insertMock).toHaveBeenCalledTimes(2);
    expect(updateReturningMock).toHaveBeenCalledTimes(1);
    expect(ensureFreeMembershipWhenNoActiveVipMock).toHaveBeenCalledWith(
      'user-1',
      expect.any(Date),
    );
  });
});
