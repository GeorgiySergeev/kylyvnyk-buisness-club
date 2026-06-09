import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const { createServerClientMock, getUserMock } = vi.hoisted(() => {
  const getUser = vi.fn();
  type CookieToSet = {
    name: string;
    options?: Record<string, unknown>;
    value: string;
  };
  type SupabaseCookieOptions = {
    cookies: {
      setAll: (cookiesToSet: CookieToSet[]) => void;
    };
  };

  return {
    createServerClientMock: vi.fn(
      (_url: string, _key: string, _options: SupabaseCookieOptions) => ({
        auth: {
          getUser,
        },
      }),
    ),
    getUserMock: getUser,
  };
});

type CookieToSet = {
  name: string;
  options?: Record<string, unknown>;
  value: string;
};
type SupabaseCookieOptions = {
  cookies: {
    setAll: (cookiesToSet: CookieToSet[]) => void;
  };
};

vi.mock('@supabase/ssr', () => ({
  createServerClient: createServerClientMock,
}));

import {
  DEV_PHONE_AUTH_COOKIE,
  encodeDevPhoneAuthCookie,
} from '../../../src/features/auth/lib/dev-auth';
import middleware from '../../../src/middleware';

function makeRequest(pathname: string, cookie?: string) {
  const headers = new Headers();

  if (cookie) {
    headers.set('cookie', cookie);
  }

  return new NextRequest(`http://127.0.0.1:3000${pathname}`, { headers });
}

describe('middleware access control', () => {
  beforeEach(() => {
    const env = process.env as Record<string, string | undefined>;

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    env.AUTH_DEV_PHONE_BYPASS_ENABLED = '0';
    delete env.AUTH_DEV_PHONE_BYPASS_SECRET;
    env.NODE_ENV = 'test';
    getUserMock.mockReset();
    createServerClientMock.mockClear();
    createServerClientMock.mockImplementation(
      (_url: string, _key: string, _options: SupabaseCookieOptions) => ({
      auth: {
        getUser: getUserMock,
      },
    }));
  });

  it('sets locale headers for public routes without redirecting', async () => {
    const response = await middleware(makeRequest('/en'));

    expect(response.headers.get('x-locale')).toBe('en');
    expect(response.headers.get('location')).toBeNull();
  });

  it('redirects protected routes to sign-in without auth context', async () => {
    const response = await middleware(makeRequest('/en/admin'));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toMatch(/\/en\/sign-in\?/);
    expect(response.headers.get('x-locale')).toBe('en');
  });

  it('lets dev-bypass requests pass through middleware when enabled', async () => {
    (process.env as Record<string, string | undefined>).AUTH_DEV_PHONE_BYPASS_ENABLED = '1';
    const cookie = `${DEV_PHONE_AUTH_COOKIE}=${await encodeDevPhoneAuthCookie('+15550000001')}`;

    const response = await middleware(makeRequest('/uk/admin', cookie));

    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-locale')).toBe('uk');
  });

  it('rejects unsigned dev-bypass cookies', async () => {
    (process.env as Record<string, string | undefined>).AUTH_DEV_PHONE_BYPASS_ENABLED = '1';
    const legacy = Buffer.from('+15550000001', 'utf8').toString('base64url');
    const cookie = `${DEV_PHONE_AUTH_COOKIE}=${legacy}`;

    const response = await middleware(makeRequest('/uk/admin', cookie));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toMatch(/\/uk\/sign-in\?/);
  });

  it('preserves locale headers when Supabase refreshes cookies', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
    getUserMock.mockResolvedValueOnce({ data: { user: { id: 'auth-user-1' } } });
    createServerClientMock.mockImplementationOnce(
      (_url: string, _key: string, options: SupabaseCookieOptions) => {
      options.cookies.setAll([
        {
          name: 'sb-refresh-token',
          options: { path: '/' },
          value: 'new-token',
        },
      ]);

      return {
        auth: {
          getUser: getUserMock,
        },
      };
    });

    const response = await middleware(makeRequest('/en/admin'));

    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-locale')).toBe('en');
    expect(response.cookies.get('sb-refresh-token')?.value).toBe('new-token');
  });
});
