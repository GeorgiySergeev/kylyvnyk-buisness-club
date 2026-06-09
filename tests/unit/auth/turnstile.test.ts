import { beforeEach, describe, expect, it, vi } from 'vitest';

const envMock = {
  AUTH_DEV_PHONE_BYPASS_ENABLED: '',
  NODE_ENV: 'development',
  TURNSTILE_SECRET_KEY: 'turnstile_secret_test',
};

const fetchMock = vi.fn();

vi.mock('@/lib/env', () => ({
  env: envMock,
}));
vi.mock('@/lib/log', () => ({
  log: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('verifyTurnstileToken', () => {
  beforeEach(() => {
    vi.resetModules();
    envMock.AUTH_DEV_PHONE_BYPASS_ENABLED = '';
    envMock.NODE_ENV = 'development';
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('rejects dummy tokens when the dev bypass flag is disabled', async () => {
    fetchMock.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({ success: false, 'error-codes': ['invalid-input-response'] }),
    });
    const { verifyTurnstileToken } = await import('../../../src/lib/captcha/turnstile');

    await expect(verifyTurnstileToken('XXXX.dummy.token.XXXX')).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('accepts dummy tokens only when the dev bypass flag is enabled outside production', async () => {
    envMock.AUTH_DEV_PHONE_BYPASS_ENABLED = '1';
    const { verifyTurnstileToken } = await import('../../../src/lib/captcha/turnstile');

    await expect(verifyTurnstileToken('XXXX.dummy.token.XXXX')).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
