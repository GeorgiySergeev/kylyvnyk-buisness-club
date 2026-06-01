import assert from 'node:assert/strict';
import test from 'node:test';

import {
  adminSearchInputSchema,
  normalizeAdminSearchQuery,
} from '../../src/features/admin/schemas/admin-search.schema';

test('admin global search ignores queries shorter than two characters', () => {
  assert.equal(normalizeAdminSearchQuery(''), null);
  assert.equal(normalizeAdminSearchQuery(' a '), null);
});

test('admin global search normalizes valid queries', () => {
  assert.equal(normalizeAdminSearchQuery('  alice  '), 'alice');
});

test('admin global search schema accepts a supported locale and query', () => {
  const parsed = adminSearchInputSchema.safeParse({
    locale: 'en',
    q: 'alice@example.com',
  });

  assert.equal(parsed.success, true);
});

test('admin global search schema rejects unsupported locales and overlong queries', () => {
  assert.equal(adminSearchInputSchema.safeParse({ locale: 'de', q: 'alice' }).success, false);
  assert.equal(adminSearchInputSchema.safeParse({ locale: 'en', q: 'x'.repeat(121) }).success, false);
});
