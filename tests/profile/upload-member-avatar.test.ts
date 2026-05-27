import assert from 'node:assert/strict';
import test from 'node:test';

import { validateAvatarFile } from '../../src/features/profile/lib/avatar-file-validation';
import { AVATAR_MAX_BYTES } from '../../src/features/profile/schemas/member-profile.schema';

test('validateAvatarFile rejects files larger than 2 MB', () => {
  const file = new File([new Uint8Array(AVATAR_MAX_BYTES + 1)], 'big.png', {
    type: 'image/png',
  });

  assert.throws(() => validateAvatarFile(file), /2 MB/);
});

test('validateAvatarFile rejects unsupported mime types', () => {
  const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });

  assert.throws(() => validateAvatarFile(file), /image\/jpeg, image\/png, image\/webp/);
});

test('validateAvatarFile accepts a small png', () => {
  const file = new File(['x'], 'avatar.png', { type: 'image/png' });

  assert.doesNotThrow(() => validateAvatarFile(file));
});
