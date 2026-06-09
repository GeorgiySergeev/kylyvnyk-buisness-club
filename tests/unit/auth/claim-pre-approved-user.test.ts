import { beforeEach, describe, expect, it, vi } from 'vitest';

const findFirstMock = vi.fn();
const updateMock = vi.fn();
const insertMock = vi.fn();
const ensureFreeMembershipWhenNoActiveVipMock = vi.fn();
const ensureCardForUserMock = vi.fn();

vi.mock('server-only', () => ({}));

vi.mock('@/db/client', () => ({
  db: {
    insert: insertMock,
    query: {
      users: {
        findFirst: findFirstMock,
      },
    },
    update: updateMock,
  },
}));

vi.mock('@/features/billing/lib/membership-access', () => ({
  ensureFreeMembershipWhenNoActiveVip: ensureFreeMembershipWhenNoActiveVipMock,
}));

vi.mock('@/features/auth/lib/card', () => ({
  ensureCardForUser: ensureCardForUserMock,
}));

describe('claimPreApprovedUser', () => {
  beforeEach(() => {
    findFirstMock.mockReset();
    updateMock.mockReset();
    insertMock.mockReset();
    ensureFreeMembershipWhenNoActiveVipMock.mockReset();
    ensureCardForUserMock.mockReset();

    insertMock.mockReturnValue({
      values: vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
      }),
    });
    ensureFreeMembershipWhenNoActiveVipMock.mockResolvedValue(undefined);
    ensureCardForUserMock.mockResolvedValue({ id: 'card-1' });
  });

  it('returns NOT_FOUND when no pre-approved user exists', async () => {
    findFirstMock.mockResolvedValue(null);
    const { claimPreApprovedUser } = await import(
      '../../../src/features/auth/lib/claim-pre-approved-user'
    );

    const result = await claimPreApprovedUser({
      devBypass: false,
      phone: '+380501234567',
      providerUserId: 'supabase-user-1',
    });

    expect(result).toEqual({ ok: false, reason: 'NOT_FOUND' });
  });

  it('rejects inactive and banned users', async () => {
    const { claimPreApprovedUser } = await import(
      '../../../src/features/auth/lib/claim-pre-approved-user'
    );

    findFirstMock.mockResolvedValueOnce({
      deletedAt: null,
      id: 'user-1',
      phone: '+380501234567',
      status: 'INACTIVE',
      supabaseUserId: null,
    });
    expect(
      await claimPreApprovedUser({
        devBypass: false,
        phone: '+380501234567',
        providerUserId: 'supabase-user-1',
      }),
    ).toEqual({ ok: false, reason: 'INACTIVE' });

    findFirstMock.mockResolvedValueOnce({
      deletedAt: null,
      id: 'user-1',
      phone: '+380501234567',
      status: 'BANNED',
      supabaseUserId: null,
    });
    expect(
      await claimPreApprovedUser({
        devBypass: false,
        phone: '+380501234567',
        providerUserId: 'supabase-user-1',
      }),
    ).toEqual({ ok: false, reason: 'BANNED' });
  });

  it('links phone-only users and records audit without PII payload', async () => {
    findFirstMock.mockResolvedValue({
      deletedAt: null,
      id: 'user-1',
      phone: '+380501234567',
      status: 'ACTIVE',
      supabaseUserId: null,
    });

    const returningMock = vi.fn().mockResolvedValue([
      {
        id: 'user-1',
        phone: '+380501234567',
        status: 'ACTIVE',
        supabaseUserId: 'supabase-user-1',
      },
    ]);
    const whereMock = vi.fn().mockReturnValue({ returning: returningMock });
    const setMock = vi.fn().mockReturnValue({ where: whereMock });
    updateMock.mockReturnValue({ set: setMock });

    const auditValuesMock = vi.fn().mockResolvedValue(undefined);
    insertMock
      .mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
        }),
      })
      .mockReturnValueOnce({
        values: auditValuesMock,
      });

    const { claimPreApprovedUser } = await import(
      '../../../src/features/auth/lib/claim-pre-approved-user'
    );

    const result = await claimPreApprovedUser({
      devBypass: false,
      phone: '+380501234567',
      providerUserId: 'supabase-user-1',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.linked).toBe(true);
      expect(result.user.supabaseUserId).toBe('supabase-user-1');
    }

    expect(auditValuesMock).toHaveBeenCalledWith({
      action: 'USER_PHONE_CLAIMED',
      actorUserId: 'user-1',
      entityId: 'user-1',
      entityType: 'user',
      payload: { authProvider: 'supabase', replacedDevLink: false },
    });
  });
});
