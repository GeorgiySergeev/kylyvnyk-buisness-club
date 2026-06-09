import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireUserMock = vi.fn();
const canAccessMock = vi.fn();
const isSuperAdminMock = vi.fn();
const redirectMock = vi.fn((href: string) => {
  throw new Error(`NEXT_REDIRECT:${href}`);
});

vi.mock('server-only', () => ({}));
vi.mock('next/navigation', () => ({
  redirect: redirectMock,
}));
vi.mock('@/features/auth/lib/current-user', () => ({
  requireUser: requireUserMock,
}));
vi.mock('@/lib/auth/permissions', () => ({
  canAccess: canAccessMock,
  isSuperAdmin: isSuperAdminMock,
}));
vi.mock('@/db/client', () => ({
  db: {
    query: {
      userRoles: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe('guardPermission', () => {
  beforeEach(() => {
    vi.resetModules();
    requireUserMock.mockReset();
    canAccessMock.mockReset();
    isSuperAdminMock.mockReset();
    redirectMock.mockClear();
  });

  it('allows users with explicit permission', async () => {
    const user = { id: 'user-1', role: 'MEMBER' };
    requireUserMock.mockResolvedValueOnce(user);
    canAccessMock.mockResolvedValueOnce(true);
    const { guardPermission } = await import('../../../src/features/auth/lib/permission-guards');

    await expect(guardPermission('en', 'businesses', 'view')).resolves.toBe(user);
    expect(isSuperAdminMock).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('allows superadmins even without an explicit permission row', async () => {
    const user = { id: 'admin-1', role: 'ADMIN' };
    requireUserMock.mockResolvedValueOnce(user);
    canAccessMock.mockResolvedValueOnce(false);
    isSuperAdminMock.mockResolvedValueOnce(true);
    const { guardPermission } = await import('../../../src/features/auth/lib/permission-guards');

    await expect(guardPermission('en', 'businesses', 'view')).resolves.toBe(user);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('redirects denied members home', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'user-1', role: 'MEMBER' });
    canAccessMock.mockResolvedValueOnce(false);
    isSuperAdminMock.mockResolvedValueOnce(false);
    const { guardPermission } = await import('../../../src/features/auth/lib/permission-guards');

    await expect(guardPermission('en', 'businesses', 'view')).rejects.toThrow('NEXT_REDIRECT:/en');
  });

  it('redirects denied admins to the admin index', async () => {
    requireUserMock.mockResolvedValueOnce({ id: 'admin-1', role: 'ADMIN' });
    canAccessMock.mockResolvedValueOnce(false);
    isSuperAdminMock.mockResolvedValueOnce(false);
    const { guardPermission } = await import('../../../src/features/auth/lib/permission-guards');

    await expect(guardPermission('en', 'businesses', 'view')).rejects.toThrow('NEXT_REDIRECT:/en/admin');
  });
});
