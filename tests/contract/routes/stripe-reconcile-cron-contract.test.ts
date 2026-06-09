import { beforeEach, describe, expect, it, vi } from 'vitest';

const envMock = {
  CRON_SECRET: 'cron_secret_test',
};
const reconcileStripeSubscriptionsMock = vi.fn();

vi.mock('server-only', () => ({}));
vi.mock('@/lib/env', () => ({
  env: envMock,
}));
vi.mock('@/lib/log', () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));
vi.mock('@/features/billing/lib/stripe-reconciliation', () => ({
  reconcileStripeSubscriptions: reconcileStripeSubscriptionsMock,
}));

describe('Stripe reconcile cron route contract', () => {
  beforeEach(() => {
    vi.resetModules();
    envMock.CRON_SECRET = 'cron_secret_test';
    reconcileStripeSubscriptionsMock.mockReset();
    reconcileStripeSubscriptionsMock.mockResolvedValue({ checked: 1, updated: 0 });
  });

  it('fails closed when CRON_SECRET is not configured', async () => {
    envMock.CRON_SECRET = '';
    const { POST } = await import('../../../src/app/api/cron/stripe-reconcile/route');

    const response = await POST(new Request('http://127.0.0.1/api/cron/stripe-reconcile', {
      method: 'POST',
    }));

    expect(response.status).toBe(404);
    expect(reconcileStripeSubscriptionsMock).not.toHaveBeenCalled();
  });

  it('rejects requests with the wrong bearer token', async () => {
    const { POST } = await import('../../../src/app/api/cron/stripe-reconcile/route');

    const response = await POST(new Request('http://127.0.0.1/api/cron/stripe-reconcile', {
      headers: { authorization: 'Bearer wrong' },
      method: 'POST',
    }));

    expect(response.status).toBe(401);
    expect(reconcileStripeSubscriptionsMock).not.toHaveBeenCalled();
  });

  it('runs reconciliation for the configured bearer token', async () => {
    const { POST } = await import('../../../src/app/api/cron/stripe-reconcile/route');

    const response = await POST(new Request('http://127.0.0.1/api/cron/stripe-reconcile', {
      headers: { authorization: 'Bearer cron_secret_test' },
      method: 'POST',
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, result: { checked: 1, updated: 0 } });
    expect(reconcileStripeSubscriptionsMock).toHaveBeenCalledTimes(1);
  });
});
