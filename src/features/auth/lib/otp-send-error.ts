import type { Key } from '@/lib/i18n/t-server';

export function resolveOtpSendFailureMessage(
  cause: string,
  tAuth: (key: Key<'auth'>) => string,
): string {
  const normalized = cause.toLowerCase();

  if (normalized.includes('unsupported phone provider')) {
    return tAuth('phoneAuthOtpProviderNotConfigured');
  }

  if (normalized.includes('signups not allowed')) {
    return tAuth('phoneAuthOtpSignupsDisabled');
  }

  return tAuth('phoneAuthOtpSendFailed');
}
