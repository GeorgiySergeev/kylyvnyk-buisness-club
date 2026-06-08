import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { log } from '@/lib/log';

import { AvatarUploadError, validateAvatarFile } from './avatar-file-validation';

const AVATARS_BUCKET = 'avatars';

export { AvatarUploadError, validateAvatarFile } from './avatar-file-validation';

export async function uploadMemberAvatar(
  supabase: SupabaseClient,
  supabaseUserId: string,
  file: File,
): Promise<string> {
  if (!supabaseUserId.trim()) {
    throw new AvatarUploadError(
      'MISSING_SUPABASE_USER',
      'User has no linked Supabase account.',
    );
  }

  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser || supabaseUser.id !== supabaseUserId) {
    throw new AvatarUploadError(
      'MISSING_SUPABASE_USER',
      'Supabase session does not match the linked account.',
    );
  }

  validateAvatarFile(file);

  const objectPath = `${supabaseUserId}/avatar`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(objectPath, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    log.error('Avatar storage upload failed', {
      bucket: AVATARS_BUCKET,
      objectPath,
      statusCode: uploadError.statusCode,
      storageError: uploadError.message,
    });
    throw new AvatarUploadError(
      'STORAGE_ERROR',
      uploadError.message || 'Avatar upload failed.',
    );
  }

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(objectPath);

  if (!data.publicUrl) {
    throw new AvatarUploadError('STORAGE_ERROR', 'Could not resolve avatar URL.');
  }

  return data.publicUrl;
}
