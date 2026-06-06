import assert from 'node:assert/strict';
import { test } from 'vitest';

import { introductionRequestSchema } from '../../../src/features/introductions/schemas/introduction.schema';

const validInput = {
  clientContact: '+380501112233',
  clientName: 'Alice Partner',
  message: 'Looking for a private meeting next week.',
  targetBusinessId: 'a5d2fc7d-69fd-4f8a-9e61-58c4c81a0f55',
};

test('accepts a valid introduction request', () => {
  const parsed = introductionRequestSchema.safeParse(validInput);

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.clientName, 'Alice Partner');
    assert.equal(parsed.data.targetBusinessId, validInput.targetBusinessId);
  }
});

test('rejects an invalid target business id', () => {
  const parsed = introductionRequestSchema.safeParse({
    ...validInput,
    targetBusinessId: 'not-a-uuid',
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    assert.ok(parsed.error.flatten().fieldErrors.targetBusinessId?.length);
  }
});

test('rejects missing client name and contact', () => {
  const parsed = introductionRequestSchema.safeParse({
    ...validInput,
    clientContact: '',
    clientName: '',
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    assert.ok(errors.clientContact?.length);
    assert.ok(errors.clientName?.length);
  }
});

test('rejects an overlong introduction message', () => {
  const parsed = introductionRequestSchema.safeParse({
    ...validInput,
    message: 'a'.repeat(501),
  });

  assert.equal(parsed.success, false);
  if (!parsed.success) {
    assert.ok(parsed.error.flatten().fieldErrors.message?.length);
  }
});
