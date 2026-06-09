import { beforeEach, describe, expect, it } from 'vitest';

import {
  decodeDevPhoneAuthCookie,
  encodeDevPhoneAuthCookie,
} from '../../../src/features/auth/lib/dev-auth';

describe('dev phone auth cookie', () => {
  beforeEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = 'test';
    delete process.env.AUTH_DEV_PHONE_BYPASS_SECRET;
  });

  it('round-trips a signed phone value in tests', async () => {
    const cookie = await encodeDevPhoneAuthCookie('+15550000001');

    expect(cookie).toContain('.');
    await expect(decodeDevPhoneAuthCookie(cookie)).resolves.toBe('+15550000001');
  });

  it('rejects legacy unsigned payloads', async () => {
    const legacy = Buffer.from('+15550000001', 'utf8').toString('base64url');

    await expect(decodeDevPhoneAuthCookie(legacy)).resolves.toBeNull();
  });

  it('rejects forged signatures', async () => {
    const cookie = await encodeDevPhoneAuthCookie('+15550000001');
    const [payload] = cookie.split('.');
    const forgedPayload = Buffer.from('+15550000002', 'utf8').toString('base64url');

    await expect(
      decodeDevPhoneAuthCookie(`${forgedPayload}.${cookie.slice(payload.length + 1)}`),
    ).resolves.toBeNull();
  });
});
