import type { ErrorEvent } from '@sentry/nextjs';

const SENSITIVE_HEADER_PATTERN = /cookie|authorization|stripe-signature/i;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

function scrubString(value: string): string {
  return value.replace(EMAIL_PATTERN, '[email]');
}

export function scrubSentryEvent(event: ErrorEvent): ErrorEvent | null {
  if (event.request?.headers) {
    for (const key of Object.keys(event.request.headers)) {
      if (SENSITIVE_HEADER_PATTERN.test(key)) {
        event.request.headers[key] = '[Filtered]';
      }
    }
  }

  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
  }

  if (typeof event.message === 'string') {
    event.message = scrubString(event.message);
  }

  if (typeof event.exception?.values?.[0]?.value === 'string') {
    event.exception.values[0].value = scrubString(event.exception.values[0].value);
  }

  return event;
}
