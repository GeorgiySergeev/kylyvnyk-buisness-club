import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const limitMock = vi.fn();

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
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('checkSmsOtpRateLimit', () => {
  beforeEach(() => {
    vi.resetModules();
    limitMock.mockReset();
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
});
