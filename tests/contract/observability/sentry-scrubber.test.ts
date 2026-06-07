import type { ErrorEvent } from '@sentry/nextjs';
import { describe, expect, test } from 'vitest';

import { scrubSentryEvent } from '@/lib/sentry/before-send';

describe('Sentry scrubber contract', () => {
  test('removes sensitive request headers and user identifiers', () => {
    const event = {
      request: {
        headers: {
          authorization: 'Bearer token',
          cookie: 'session=value',
          'stripe-signature': 'secret-signature',
          'x-request-id': 'safe-request-id',
        },
      },
      user: {
        id: 'user_123',
        email: 'person@example.com',
        ip_address: '203.0.113.10',
      },
    } as unknown as ErrorEvent;

    const scrubbed = scrubSentryEvent(event);

    expect(scrubbed?.request?.headers?.authorization).toBe('[Filtered]');
    expect(scrubbed?.request?.headers?.cookie).toBe('[Filtered]');
    expect(scrubbed?.request?.headers?.['stripe-signature']).toBe('[Filtered]');
    expect(scrubbed?.request?.headers?.['x-request-id']).toBe('safe-request-id');
    expect(scrubbed?.user).toEqual({ id: 'user_123' });
  });

  test('redacts email addresses from message and exception value', () => {
    const event = {
      message: 'Failed for person@example.com',
      exception: {
        values: [
          {
            value: 'Checkout failed for second@example.com',
          },
        ],
      },
    } as unknown as ErrorEvent;

    const scrubbed = scrubSentryEvent(event);

    expect(scrubbed?.message).toBe('Failed for [email]');
    expect(scrubbed?.exception?.values?.[0]?.value).toBe('Checkout failed for [email]');
  });
});
