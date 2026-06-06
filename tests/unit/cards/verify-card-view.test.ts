import { describe, expect, it } from 'vitest';

import {
  formatVerifyCardExpiresAt,
  getVerifyCardClientIp,
  getVerifyCardStatusClassName,
} from '../../../src/features/cards/lib/verify-card-view';

describe('verify-card view helpers', () => {
  it('prefers the first forwarded IP when present', () => {
    const headersList = new Headers({
      'x-forwarded-for': '203.0.113.10, 198.51.100.8',
      'x-real-ip': '198.51.100.8',
    });

    expect(getVerifyCardClientIp(headersList)).toBe('203.0.113.10');
  });

  it('falls back to x-real-ip and then unknown', () => {
    expect(getVerifyCardClientIp(new Headers({ 'x-real-ip': '198.51.100.8' }))).toBe(
      '198.51.100.8',
    );
    expect(getVerifyCardClientIp(new Headers())).toBe('unknown');
  });

  it('maps public statuses to stable badge classes', () => {
    expect(getVerifyCardStatusClassName('ACTIVE')).toContain('text-ds-success');
    expect(getVerifyCardStatusClassName('NOT_FOUND')).toContain('text-muted-foreground');
    expect(getVerifyCardStatusClassName('EXPIRED')).toContain('text-destructive');
  });

  it('formats expiration dates and preserves fallback copy', () => {
    expect(formatVerifyCardExpiresAt('2027-01-02T00:00:00.000Z', 'No expiration')).toBe(
      'Jan 02, 2027',
    );
    expect(formatVerifyCardExpiresAt(null, 'No expiration')).toBe('No expiration');
  });
});
