import assert from 'node:assert/strict';
import { test } from 'vitest';

import { submitBusinessSchema } from '../../../src/features/business/schemas/submit-business.schema';

test('submitBusinessSchema requires core business fields', () => {
  const parsed = submitBusinessSchema.safeParse({
    name: 'Acme',
  });

  assert.equal(parsed.success, false);
});

test('submitBusinessSchema accepts a valid business submission', () => {
  const parsed = submitBusinessSchema.safeParse({
    categoryId: 1,
    cityId: 2,
    countryId: 3,
    email: 'hello@acme.test',
    name: 'Acme Studio',
    phone: '+15550000001',
    representativeName: 'Ada Lovelace',
    website: 'https://acme.test',
  });

  assert.equal(parsed.success, true);
});
