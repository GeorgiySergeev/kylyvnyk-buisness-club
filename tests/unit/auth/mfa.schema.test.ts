import assert from 'node:assert/strict';
import { test } from 'vitest';

import { isMfaVerifiedFromAssuranceLevel } from '../../../src/features/auth/lib/mfa-policy';
import { mfaTotpVerifySchema } from '../../../src/features/auth/schemas/mfa.schema';

test('MFA assurance policy accepts aal2 sessions', () => {
  assert.equal(isMfaVerifiedFromAssuranceLevel({ currentLevel: 'aal2' }), true);
});

test('MFA assurance policy rejects non-aal2 sessions', () => {
  assert.equal(isMfaVerifiedFromAssuranceLevel({ currentLevel: 'aal1' }), false);
  assert.equal(isMfaVerifiedFromAssuranceLevel({ currentLevel: null }), false);
  assert.equal(isMfaVerifiedFromAssuranceLevel(null), false);
});

test('MFA verify schema accepts a 6 digit TOTP code', () => {
  const parsed = mfaTotpVerifySchema.safeParse({
    code: '123456',
    factorId: 'factor-123',
  });

  assert.equal(parsed.success, true);
});

test('MFA verify schema rejects malformed TOTP codes before Supabase calls', () => {
  const parsed = mfaTotpVerifySchema.safeParse({
    code: '12-456',
    factorId: 'factor-123',
  });

  assert.equal(parsed.success, false);
});
