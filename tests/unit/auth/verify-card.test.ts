import assert from 'node:assert/strict';
import { test } from 'vitest';

import {
  createPublicCardDto,
  PUBLIC_CARD_DTO_KEYS,
} from '../../../src/features/cards/lib/public-card-dto';
import {
  deriveCountryCodeFromPhone,
  generateCardNumber,
} from '../../../src/features/auth/lib/card-number';

test('public card dto exposes only the allowed PII-safe keys for existing cards', () => {
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

  assert.deepEqual(Object.keys(dto).sort(), [...PUBLIC_CARD_DTO_KEYS].sort());
  assert.deepEqual(dto, {
    expiresAt: '2027-01-02T00:00:00.000Z',
    memberName: 'Ada Lovelace',
    memberType: 'VIP',
    number: 'VIP-US-0123456789',
    status: 'ACTIVE',
  });
});

test('public card dto keeps the same key set for missing cards', () => {
  const dto = createPublicCardDto(null, 'VIP-US-NOTFOUND1', 'Member');

  assert.deepEqual(Object.keys(dto).sort(), [...PUBLIC_CARD_DTO_KEYS].sort());
  assert.deepEqual(dto, {
    expiresAt: null,
    memberName: null,
    memberType: null,
    number: 'VIP-US-NOTFOUND1',
    status: 'NOT_FOUND',
  });
});

test('card numbers use member type, country, and high-entropy Crockford base32 suffix', () => {
  const number = generateCardNumber('+1 555 000 0001', 'BUSINESS');

  assert.match(number, /^business-US-[0-9A-HJKMNP-TV-Z]{10}$/);
});

test('card number country derivation falls back to INT for unknown phone prefixes', () => {
  assert.equal(deriveCountryCodeFromPhone('+999123456789'), 'INT');
});
