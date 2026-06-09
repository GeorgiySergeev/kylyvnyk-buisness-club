import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const limitMock = vi.fn();
const errorMock = vi.fn();
const warnMock = vi.fn();

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    static fixedWindow = vi.fn();
    static slidingWindow = vi.fn();

    limit = limitMock;
  },
}));

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(),
}));

vi.mock('@/lib/env', () => ({
  env: {
    NODE_ENV: 'production',
    UPSTASH_REDIS_REST_TOKEN: 'token',
    UPSTASH_REDIS_REST_URL: 'https://example.upstash.io',
  },
}));

vi.mock('@/lib/log', () => ({
  log: {
    error: errorMock,
    warn: warnMock,
  },
}));

describe('checkSmsOtpRateLimit', () => {
  beforeEach(() => {
    vi.resetModules();
    limitMock.mockReset();
    errorMock.mockClear();
    warnMock.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('fails closed in production when Upstash is unreachable', async () => {
    limitMock.mockRejectedValueOnce(new Error('redis unavailable'));
    const { checkSmsOtpRateLimit } = await import('../../../src/lib/rate-limit/upstash');

    const result = await checkSmsOtpRateLimit('+380501234567:203.0.113.10');

    expect(result.success).toBe(false);
  });

  it('masks verify-card rate limiter identifiers when logging failures', async () => {
    limitMock.mockRejectedValueOnce(new Error('redis unavailable'));
    const { checkVerifyCardRateLimit } = await import('../../../src/lib/rate-limit/upstash');

    const result = await checkVerifyCardRateLimit({
      ip: '203.0.113.10',
      number: 'vip-UA-SECRET1234',
    });

    expect(result.success).toBe(true);
    expect(warnMock).toHaveBeenCalledWith(
      'Verify card rate limiter error (fail-open)',
      expect.objectContaining({
        cause: 'redis unavailable',
        ipFingerprint: expect.any(String),
        numberFingerprint: expect.any(String),
      }),
    );
    expect(JSON.stringify(warnMock.mock.calls)).not.toContain('203.0.113.10');
    expect(JSON.stringify(warnMock.mock.calls)).not.toContain('vip-UA-SECRET1234');
  });
});
