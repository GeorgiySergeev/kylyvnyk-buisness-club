import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const returningMock = vi.fn();
const onConflictDoNothingMock = vi.fn(() => ({ returning: returningMock }));
const valuesMock = vi.fn(() => ({ onConflictDoNothing: onConflictDoNothingMock }));
const insertMock = vi.fn(() => ({ values: valuesMock }));
const whereMock = vi.fn();
const setMock = vi.fn(() => ({ where: whereMock }));
const updateMock = vi.fn(() => ({ set: setMock }));
const constructEventMock = vi.fn();
const handleCheckoutSessionCompletedMock = vi.fn();
const handleInvoicePaymentFailedMock = vi.fn();
const handleSubscriptionCreatedMock = vi.fn();
const handleSubscriptionUpdatedMock = vi.fn();

vi.mock('server-only', () => ({}));
vi.mock('@/db/client', () => ({
  db: {
    insert: insertMock,
    update: updateMock,
  },
}));
vi.mock('@/lib/env', () => ({
  env: {
    STRIPE_PRICE_BUSINESS_ANNUAL: 'price_business',
    STRIPE_PRICE_VIP_ANNUAL: 'price_vip',
    STRIPE_WEBHOOK_SECRET: 'whsec_test',
  },
}));
vi.mock('@/lib/log', () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));
vi.mock('@/lib/stripe/config', () => ({
  stripe: {
    subscriptions: {
      retrieve: vi.fn(),
    },
    webhooks: {
      constructEvent: constructEventMock,
    },
  },
}));
vi.mock('@/features/billing/lib/membership-lifecycle', () => ({
  handleCheckoutSessionCompleted: handleCheckoutSessionCompletedMock,
  handleInvoicePaymentFailed: handleInvoicePaymentFailedMock,
  handleSubscriptionCreated: handleSubscriptionCreatedMock,
  handleSubscriptionUpdated: handleSubscriptionUpdatedMock,
}));

describe('Stripe webhook route contract', () => {
  beforeEach(() => {
    vi.resetModules();
    returningMock.mockReset();
    insertMock.mockClear();
    updateMock.mockClear();
    constructEventMock.mockReset();
    handleCheckoutSessionCompletedMock.mockReset();
    handleInvoicePaymentFailedMock.mockReset();
    handleSubscriptionCreatedMock.mockReset();
    handleSubscriptionUpdatedMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects requests without a Stripe signature before touching storage', async () => {
    const { POST } = await import('../../../src/app/api/stripe/webhook/route');

    const response = await POST(new Request('http://127.0.0.1/api/stripe/webhook', {
      body: '{}',
      method: 'POST',
    }));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: 'Missing Stripe signature.' });
    expect(constructEventMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  }, 15_000);

  it('returns a duplicate acknowledgement when the event was already claimed', async () => {
    returningMock.mockResolvedValueOnce([]);
    constructEventMock.mockReturnValueOnce({
      data: {
        object: {},
      },
      id: 'evt_duplicate',
      type: 'customer.subscription.updated',
    });
    const { POST } = await import('../../../src/app/api/stripe/webhook/route');

    const response = await POST(new Request('http://127.0.0.1/api/stripe/webhook', {
      body: '{}',
      headers: {
        'stripe-signature': 'sig_test',
      },
      method: 'POST',
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ duplicate: true });
    expect(insertMock).toHaveBeenCalledTimes(1);
    expect(updateMock).not.toHaveBeenCalled();
  }, 15_000);

  it('marks an event as failed when processing throws', async () => {
    returningMock.mockResolvedValueOnce([{ id: 'claimed-1' }]);
    constructEventMock.mockReturnValueOnce({
      data: {
        object: {},
      },
      id: 'evt_fail',
      type: 'customer.subscription.updated',
    });
    handleSubscriptionUpdatedMock.mockRejectedValueOnce(new Error('boom'));

    const { POST } = await import('../../../src/app/api/stripe/webhook/route');
    const response = await POST(new Request('http://127.0.0.1/api/stripe/webhook', {
      body: '{}',
      headers: {
        'stripe-signature': 'sig_test',
      },
      method: 'POST',
    }));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Webhook processing failed.' });
    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        processedAt: expect.any(Date),
        succeeded: false,
      }),
    );
  }, 15_000);
});
