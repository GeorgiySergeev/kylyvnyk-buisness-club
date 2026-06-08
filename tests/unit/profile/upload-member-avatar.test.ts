import assert from 'node:assert/strict';
import { test, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { AvatarUploadError } from '../../../src/features/profile/lib/avatar-file-validation';
import { validateAvatarFile } from '../../../src/features/profile/lib/avatar-file-validation';
import { uploadMemberAvatar } from '../../../src/features/profile/lib/upload-member-avatar';
import { AVATAR_MAX_BYTES } from '../../../src/features/profile/schemas/member-profile.schema';

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

test('uploadMemberAvatar rejects when Supabase session user id does not match path', async () => {
  const file = new File(['x'], 'avatar.png', { type: 'image/png' });
  const supabaseUserId = '11111111-1111-1111-1111-111111111111';

  const supabase = {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: '22222222-2222-2222-2222-222222222222',
          },
        },
      }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/avatar' } }),
      }),
    },
  };

  await assert.rejects(
    () => uploadMemberAvatar(supabase as never, supabaseUserId, file),
    (error: unknown) => {
      assert.ok(error instanceof AvatarUploadError);
      assert.equal(error.code, 'MISSING_SUPABASE_USER');
      return true;
    },
  );
});

test('uploadMemberAvatar rejects when Supabase session is missing', async () => {
  const file = new File(['x'], 'avatar.png', { type: 'image/png' });
  const supabaseUserId = '11111111-1111-1111-1111-111111111111';

  const supabase = {
    auth: {
      getUser: async () => ({ data: { user: null } }),
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/avatar' } }),
      }),
    },
  };

  await assert.rejects(
    () => uploadMemberAvatar(supabase as never, supabaseUserId, file),
    (error: unknown) => {
      assert.ok(error instanceof AvatarUploadError);
      assert.equal(error.code, 'MISSING_SUPABASE_USER');
      return true;
    },
  );
});

test('uploadMemberAvatar uploads when session user id matches path', async () => {
  const file = new File(['x'], 'avatar.png', { type: 'image/png' });
  const supabaseUserId = '11111111-1111-1111-1111-111111111111';
  let uploadedPath = '';

  const supabase = {
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: supabaseUserId,
          },
        },
      }),
    },
    storage: {
      from: () => ({
        upload: async (path: string) => {
          uploadedPath = path;
          return { error: null };
        },
        getPublicUrl: (path: string) => ({
          data: { publicUrl: `https://example.supabase.co/storage/v1/object/public/avatars/${path}` },
        }),
      }),
    },
  };

  const publicUrl = await uploadMemberAvatar(supabase as never, supabaseUserId, file);

  assert.equal(uploadedPath, `${supabaseUserId}/avatar`);
  assert.match(publicUrl, /\/avatars\//);
});
