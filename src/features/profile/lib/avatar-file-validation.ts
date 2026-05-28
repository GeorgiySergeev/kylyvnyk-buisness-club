import {
  ALLOWED_AVATAR_MIME_TYPES,
  type AllowedAvatarMimeType,
  AVATAR_MAX_BYTES,
  isAllowedAvatarMimeType,
} from '../schemas/member-profile.schema';

export type AvatarUploadErrorCode =
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'STORAGE_ERROR'
  | 'MISSING_SUPABASE_USER';

export class AvatarUploadError extends Error {
  readonly code: AvatarUploadErrorCode;

  constructor(code: AvatarUploadErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'AvatarUploadError';
  }
}

export function validateAvatarFile(file: File): void {
  if (file.size > AVATAR_MAX_BYTES) {
    throw new AvatarUploadError('FILE_TOO_LARGE', 'Avatar must be 2 MB or smaller.');
  }

  if (!isAllowedAvatarMimeType(file.type)) {
    throw new AvatarUploadError(
      'INVALID_FILE_TYPE',
      `Avatar must be one of: ${ALLOWED_AVATAR_MIME_TYPES.join(', ')}.`,
    );
  }
}

export type { AllowedAvatarMimeType };
