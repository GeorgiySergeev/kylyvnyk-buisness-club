import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './msw/server';

process.env.SENTRY_DSN ??= '';
process.env.NEXT_PUBLIC_SENTRY_DSN ??= '';
process.env.AUTH_DEV_PHONE_BYPASS_ENABLED ??= '0';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
