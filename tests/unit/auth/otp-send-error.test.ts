import { describe, expect, it } from 'vitest';

import { resolveOtpSendFailureMessage } from '../../../src/features/auth/lib/otp-send-error';

const tAuth = (key: string) => key;

describe('resolveOtpSendFailureMessage', () => {
  it('maps unsupported phone provider errors', () => {
    expect(resolveOtpSendFailureMessage('Unsupported phone provider', tAuth)).toBe(
      'phoneAuthOtpProviderNotConfigured',
    );
  });

  it('maps disabled signup errors', () => {
    expect(resolveOtpSendFailureMessage('Signups not allowed for otp', tAuth)).toBe(
      'phoneAuthOtpSignupsDisabled',
    );
  });

  it('falls back to the generic OTP send failure message', () => {
    expect(resolveOtpSendFailureMessage('provider down', tAuth)).toBe('phoneAuthOtpSendFailed');
  });
});
