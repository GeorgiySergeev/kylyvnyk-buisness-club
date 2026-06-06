import assert from 'node:assert/strict';
import { test } from 'vitest';

import { slugifyBusinessName } from '../../../src/features/business/lib/slugify-business-name';

test('slugifyBusinessName normalizes business names', () => {
  assert.equal(slugifyBusinessName(' Kylyvnyk Club '), 'kylyvnyk-club');
  assert.equal(slugifyBusinessName('Café №1'), 'cafe-o1');
});
