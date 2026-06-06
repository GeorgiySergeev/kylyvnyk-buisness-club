import { describe, expect, it } from 'vitest';

import {
  normalizePhoneNumber,
  phoneNumberSchema,
  phoneOtpRequestSchema,
  phoneOtpVerifySchema,
} from '../../../src/features/auth/lib/phone';

describe('phone utils', () => {
  it('normalizes a number by prefixing plus and stripping formatting', () => {
    expect(normalizePhoneNumber(' 1 (555) 000-0003 ')).toBe('+15550000003');
    expect(normalizePhoneNumber('+38 099-123-45-67')).toBe('+380991234567');
  });

  it('accepts valid international phone input', () => {
    const parsed = phoneNumberSchema.safeParse(' +1 (555) 000-0001 ');

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toBe('+15550000001');
    }
  });

  it('rejects malformed phone input', () => {
    for (const value of ['12345', '+0123456', '+1 23', '+']) {
      expect(phoneNumberSchema.safeParse(value).success).toBe(false);
    }
  });

  it('normalizes request input and strips unknown keys', () => {
    const parsed = phoneOtpRequestSchema.safeParse({
      displayName: 'Legacy Name',
      phone: '+380 50 123 45 67',
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.phone).toBe('+380501234567');
      expect('displayName' in parsed.data).toBe(false);
    }
  });

  it('validates a 6-digit verification code', () => {
    expect(
      phoneOtpVerifySchema.safeParse({
        code: '123456',
        phone: '+15550000001',
      }).success,
    ).toBe(true);

    expect(
      phoneOtpVerifySchema.safeParse({
        code: '12345a',
        phone: '+15550000001',
      }).success,
    ).toBe(false);
  });
});
