import { scrubSentryEvent } from '@/lib/sentry/before-send';

export const SENTRY_DENY_URLS = [/supabase\.co\/auth/i, /js\.stripe\.com/i] as const;

export function getTracesSampleRate(): number {
  if (process.env.VERCEL_ENV === 'preview') {
    return 1;
  }

  if (process.env.NODE_ENV === 'production') {
    return 0.1;
  }

  return 0;
}

export function isSentryEnabled(): boolean {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();

  if (!dsn || dsn.includes('REPLACE_ME') || dsn.includes('example@')) {
    return false;
  }

  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'preview';
}

export function getBaseSentryOptions() {
  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    enabled: isSentryEnabled(),
    sendDefaultPii: false,
    tracesSampleRate: getTracesSampleRate(),
    denyUrls: [...SENTRY_DENY_URLS],
    beforeSend: scrubSentryEvent,
  };
}
