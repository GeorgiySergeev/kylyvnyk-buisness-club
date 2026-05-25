import assert from 'node:assert/strict';
import test from 'node:test';

import { setIntroductionStatusSchema } from '../../src/features/introductions/schemas/introduction-moderation.schema';

const validInput = {
  adminNote: 'Reviewed and approved for next-step coordination.',
  introductionId: '4b6dc889-8f7a-40fd-9df0-0238586c6355',
  status: 'APPROVED',
};

test('accepts valid moderation input', () => {
  const parsed = setIntroductionStatusSchema.safeParse(validInput);

  assert.equal(parsed.success, true);
});

test('rejects invalid UUID', () => {
  const parsed = setIntroductionStatusSchema.safeParse({
    ...validInput,
    introductionId: 'wrong-id',
  });

  assert.equal(parsed.success, false);
});

test('rejects invalid status enum', () => {
  const parsed = setIntroductionStatusSchema.safeParse({
    ...validInput,
    status: 'SUBMITTED',
  });

  assert.equal(parsed.success, false);
});

test('rejects overlong admin note', () => {
  const parsed = setIntroductionStatusSchema.safeParse({
    ...validInput,
    adminNote: 'x'.repeat(501),
  });

  assert.equal(parsed.success, false);
});
