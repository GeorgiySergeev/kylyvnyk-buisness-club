import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPublicCardDto,
  PUBLIC_CARD_DTO_KEYS,
} from '../../src/features/cards/lib/public-card-dto';
import { isSafeReturnBackUrl } from '../../src/features/auth/lib/return-back-url';

test('free registration flow exposes only onboarding gate before dashboard', () => {
  assert.equal(isSafeReturnBackUrl('/en/m/onboarding'), true);
  assert.equal(isSafeReturnBackUrl('/en/m/dashboard'), true);
});

test('vip registration flow keeps public card dto PII-safe after upgrade', () => {
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
  assert.equal(dto.memberType, 'VIP');
});

test('business registration flow keeps member-only status off public card dto', () => {
  const dto = createPublicCardDto(
    {
      expiresAt: null,
      memberName: 'Ada Lovelace',
      memberType: 'BUSINESS',
      number: 'business-US-0123456789',
      status: 'ACTIVE',
    },
    'business-US-0123456789',
    'Member',
  );

  assert.deepEqual(Object.keys(dto).sort(), [...PUBLIC_CARD_DTO_KEYS].sort());
  assert.equal(Object.hasOwn(dto, 'email'), false);
  assert.equal(Object.hasOwn(dto, 'phone'), false);
});
