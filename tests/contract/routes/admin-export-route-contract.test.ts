import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getCurrentUserWithRoleMock = vi.fn();
const hasVerifiedMfaInSessionMock = vi.fn();
const createAuditLogMock = vi.fn();
const fetchAdminUsersMock = vi.fn();
const fetchAdminBusinessesMock = vi.fn();

vi.mock('server-only', () => ({}));
vi.mock('@/features/auth/lib/current-user', () => ({
  getCurrentUserWithRole: getCurrentUserWithRoleMock,
}));
vi.mock('@/features/auth/lib/mfa', () => ({
  hasVerifiedMfaInSession: hasVerifiedMfaInSessionMock,
}));
vi.mock('@/lib/audit', () => ({
  createAuditLog: createAuditLogMock,
}));
vi.mock('@/features/admin/lib/export-response', async () => {
  const actual = await vi.importActual<
    typeof import('../../../src/features/admin/lib/export-response')
  >('../../../src/features/admin/lib/export-response');

  return actual;
});
vi.mock('@/features/admin/lib/users-list', () => ({
  fetchAdminUsers: fetchAdminUsersMock,
  filterAdminUsers: (rows: Array<{ displayName: string | null; memberships: Array<{ planCode: string }> | null }>, filters: { plan?: string; q?: string }) =>
    rows.filter((row) => {
      const matchesPlan = !filters.plan || row.memberships?.some((membership) => membership.planCode === filters.plan);
      const matchesQuery = !filters.q || row.displayName?.toLowerCase().includes(filters.q.toLowerCase());

      return matchesPlan && matchesQuery;
    }),
  usersToCsv: (rows: Array<{ createdAt: Date; displayName: string | null; id: string; phone: string }>) =>
    `ID,Display Name,Phone,Joined\r\n${rows
      .map((row) => `${row.id},${row.displayName ?? ''},${row.phone},${row.createdAt.toISOString()}`)
      .join('\r\n')}\r\n`,
}));
vi.mock('@/features/admin/lib/businesses-filters', () => ({
  filterAdminBusinesses: (rows: unknown[]) => rows,
}));
vi.mock('@/features/admin/lib/businesses-list', () => ({
    fetchAdminBusinesses: fetchAdminBusinessesMock,
    businessesToCsv: () => 'ID,Name\r\n',
}));

describe('admin export route contracts', () => {
  beforeEach(() => {
    vi.resetModules();
    getCurrentUserWithRoleMock.mockReset();
    hasVerifiedMfaInSessionMock.mockReset();
    createAuditLogMock.mockReset();
    fetchAdminUsersMock.mockReset();
    fetchAdminBusinessesMock.mockReset();
  }, 15_000);

  afterEach(() => {
    vi.unstubAllEnvs();
  }, 15_000);

  it('returns the typed unauthorized contract before reading export data', async () => {
    getCurrentUserWithRoleMock.mockResolvedValueOnce({ error: 'UNAUTHORIZED', ok: false });

    const { GET } = await import('../../../src/app/api/admin/users/export/route');
    const response = await GET(new Request('http://127.0.0.1/api/admin/users/export'));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Authentication required.', ok: false });
    expect(fetchAdminUsersMock).not.toHaveBeenCalled();
    expect(createAuditLogMock).not.toHaveBeenCalled();
  });

  it('returns MFA_REQUIRED for admins without verified MFA', async () => {
    getCurrentUserWithRoleMock.mockResolvedValueOnce({
      data: { id: 'admin-1' },
      ok: true,
    });
    hasVerifiedMfaInSessionMock.mockResolvedValueOnce(false);

    const { GET } = await import('../../../src/app/api/admin/businesses/export/route');
    const response = await GET(new Request('http://127.0.0.1/api/admin/businesses/export'));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: 'Admin MFA must be verified in the active session.',
      ok: false,
    });
    expect(fetchAdminBusinessesMock).not.toHaveBeenCalled();
    expect(createAuditLogMock).not.toHaveBeenCalled();
  });

  it('exports CSV and audits the filtered users response', async () => {
    getCurrentUserWithRoleMock.mockResolvedValueOnce({
      data: { id: 'admin-1' },
      ok: true,
    });
    hasVerifiedMfaInSessionMock.mockResolvedValueOnce(true);
    fetchAdminUsersMock.mockResolvedValueOnce([
      {
        country: 'United States',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        displayName: 'Ada Member',
        email: null,
        id: 'user-1',
        memberships: [
          {
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            planCode: 'VIP',
            status: 'ACTIVE',
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ],
        phone: '+15550000001',
        role: 'VIP',
        status: 'ACTIVE',
      },
    ]);

    const { GET } = await import('../../../src/app/api/admin/users/export/route');
    const response = await GET(
      new Request('http://127.0.0.1/api/admin/users/export?plan=VIP&q=Ada'),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.text()).toContain('Ada Member');
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'ADMIN_USERS_EXPORTED',
        actorUserId: 'admin-1',
        entityType: 'user',
        payload: expect.objectContaining({
          count: 1,
          filters: expect.objectContaining({ plan: 'VIP', q: 'Ada' }),
        }),
      }),
    );
  }, 15_000);
});
