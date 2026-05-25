import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PUBLIC_BUSINESS_DTO_KEYS,
  createPublicBusinessDto,
} from '../../src/features/directory/lib/public-business-dto';

test('public business dto exposes only public directory keys', () => {
  const source = {
    category: { name: 'Legal Services', slug: 'legal' },
    city: { name: 'Kyiv' },
    country: { flagEmoji: null, iso2: 'UA', name: 'Ukraine' },
    description: 'Business profile description.',
    email: 'owner@example.test',
    id: 'business-1',
    isRecommended: false,
    isTopPartner: true,
    logoUrl: null,
    name: 'KCLUB Partner',
    phone: '+15550000000',
    slug: 'kclub-partner',
    status: 'PUBLISHED',
    user: { email: 'private@example.test', phone: '+15550000001' },
    website: 'https://example.test',
  };

  const dto = createPublicBusinessDto(source);

  assert.deepEqual(Object.keys(dto).sort(), [...PUBLIC_BUSINESS_DTO_KEYS].sort());
  assert.equal('phone' in dto, false);
  assert.equal('email' in dto, false);
  assert.equal('user' in dto, false);
  assert.equal('status' in dto, false);
  assert.deepEqual(dto, {
    category: { name: 'Legal Services', slug: 'legal' },
    city: { name: 'Kyiv' },
    country: { flagEmoji: null, iso2: 'UA', name: 'Ukraine' },
    description: 'Business profile description.',
    id: 'business-1',
    isRecommended: false,
    isTopPartner: true,
    logoUrl: null,
    name: 'KCLUB Partner',
    slug: 'kclub-partner',
    website: 'https://example.test',
  });
});
