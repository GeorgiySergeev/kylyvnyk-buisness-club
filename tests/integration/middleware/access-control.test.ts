import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

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
    env.NODE_ENV = 'test';
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
    const cookie = `${DEV_PHONE_AUTH_COOKIE}=${encodeDevPhoneAuthCookie('+15550000001')}`;

    const response = await middleware(makeRequest('/uk/admin', cookie));

    expect(response.headers.get('location')).toBeNull();
    expect(response.headers.get('x-locale')).toBe('uk');
  });
});
