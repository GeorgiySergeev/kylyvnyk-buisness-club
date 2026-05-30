import assert from 'node:assert/strict';
import test from 'node:test';

import { onboardingSchema } from '../../src/features/auth/schemas/onboarding.schema';

test('requires country during onboarding', () => {
  const parsed = onboardingSchema.safeParse({
    bio: 'Founder',
    cityId: 1,
  });

  assert.equal(parsed.success, false);
});

test('accepts onboarding with country', () => {
  const parsed = onboardingSchema.safeParse({
    bio: 'Founder',
    cityId: 1,
    countryId: 2,
  });

  assert.equal(parsed.success, true);
});
