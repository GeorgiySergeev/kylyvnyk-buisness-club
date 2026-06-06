import { describe, expect, it } from 'vitest';

import {
  deriveCountryCodeFromPhone,
  generateCardNumber,
} from '../../../src/features/auth/lib/card-number';
import {
  createPublicCardDto,
  PUBLIC_CARD_DTO_KEYS,
} from '../../../src/features/cards/lib/public-card-dto';

describe('public card dto contract', () => {
  it('exposes only the allowed PII-safe keys for active cards', () => {
    const dto = createPublicCardDto(
      {
        expiresAt: new Date('2027-01-02T00:00:00.000Z'),
        memberName: 'Ada Lovelace',
        memberType: 'VIP',
        number: 'VIP-US-0123456789',
        status: 'ACTIVE',
      },
      'VIP-US-0123456789',
      'Member',
    );

    expect(Object.keys(dto).sort()).toEqual([...PUBLIC_CARD_DTO_KEYS].sort());
    expect(dto).toEqual({
      expiresAt: '2027-01-02T00:00:00.000Z',
      memberName: 'Ada Lovelace',
      memberType: 'VIP',
      number: 'VIP-US-0123456789',
      status: 'ACTIVE',
    });
  });

  it('keeps the same key set for missing cards', () => {
    const dto = createPublicCardDto(null, 'VIP-US-NOTFOUND1', 'Member');

    expect(Object.keys(dto).sort()).toEqual([...PUBLIC_CARD_DTO_KEYS].sort());
    expect(dto).toEqual({
      expiresAt: null,
      memberName: null,
      memberType: null,
      number: 'VIP-US-NOTFOUND1',
      status: 'NOT_FOUND',
    });
  });

  it('uses member type, country, and Crockford-style suffix in card numbers', () => {
    const number = generateCardNumber('+1 555 000 0001', 'BUSINESS');

    expect(number).toMatch(/^business-US-[0-9A-HJKMNP-TV-Z]{10}$/);
  });

  it('falls back to INT for unknown country prefixes', () => {
    expect(deriveCountryCodeFromPhone('+999123456789')).toBe('INT');
  });
});
