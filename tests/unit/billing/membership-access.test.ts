import { beforeEach, describe, expect, it, vi } from 'vitest';

const membershipFindFirstMock = vi.fn();
const updateSetMock = vi.fn();
const updateWhereMock = vi.fn();
const updateMock = vi.fn(() => ({ set: updateSetMock }));
const insertMock = vi.fn();
const getLatestActiveCardForUserMock = vi.fn();
const ensureCardForUserMock = vi.fn();
const archiveCurrentCardAndIssueReplacementMock = vi.fn();

vi.mock('server-only', () => ({}));
vi.mock('@/db/client', () => ({
  db: {
    insert: insertMock,
    query: {
      memberships: {
        findFirst: membershipFindFirstMock,
      },
    },
    update: updateMock,
  },
}));
vi.mock('@/features/auth/lib/card', () => ({
  archiveCurrentCardAndIssueReplacement: archiveCurrentCardAndIssueReplacementMock,
  ensureCardForUser: ensureCardForUserMock,
  getLatestActiveCardForUser: getLatestActiveCardForUserMock,
}));

function sqlObjectContains(value: unknown, needle: string, seen = new WeakSet<object>()): boolean {
  if (value === needle) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => sqlObjectContains(item, needle, seen));
  }

  if (!value || typeof value !== 'object') {
    return false;
  }

  if (seen.has(value)) {
    return false;
  }

  seen.add(value);

  return Object.values(value).some((item) => sqlObjectContains(item, needle, seen));
}

describe('setUserMembershipTier', () => {
  beforeEach(() => {
    vi.resetModules();
    membershipFindFirstMock.mockReset();
    updateSetMock.mockReset();
    updateWhereMock.mockReset();
    updateMock.mockClear();
    insertMock.mockReset();
    getLatestActiveCardForUserMock.mockReset();
    ensureCardForUserMock.mockReset();
    archiveCurrentCardAndIssueReplacementMock.mockReset();

    updateSetMock.mockReturnValue({ where: updateWhereMock });
    updateWhereMock.mockResolvedValue(undefined);
    getLatestActiveCardForUserMock.mockResolvedValue({ id: 'card-1', memberType: 'FREE' });
  });

  it('downgrades to FREE without deactivating the active FREE row', async () => {
    const activeFreeMembership = {
      deletedAt: null,
      id: 'membership-free',
      planCode: 'FREE',
      status: 'ACTIVE',
    };
    membershipFindFirstMock
      .mockResolvedValueOnce(activeFreeMembership)
      .mockResolvedValueOnce(activeFreeMembership);
    const { setUserMembershipTier } = await import(
      '../../../src/features/billing/lib/membership-access'
    );

    await setUserMembershipTier('user-1', 'FREE', new Date('2026-06-01T00:00:00.000Z'));

    const inactiveSetIndex = updateSetMock.mock.calls.findIndex(
      ([payload]) => payload.status === 'INACTIVE',
    );

    expect(inactiveSetIndex).toBeGreaterThanOrEqual(0);
    const inactiveWhere = updateWhereMock.mock.calls[inactiveSetIndex]?.[0];
    expect(sqlObjectContains(inactiveWhere, 'plan_code')).toBe(true);
    expect(sqlObjectContains(inactiveWhere, ' <> ')).toBe(true);
    expect(insertMock).not.toHaveBeenCalled();
  });
});
