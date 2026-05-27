import { z } from 'zod';

const optionalIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .optional()
  .or(z.literal('').transform(() => undefined));

export const memberProfileFieldsSchema = z.object({
  bio: z.string().trim().max(500).optional().or(z.literal('').transform(() => undefined)),
  cityId: optionalIdSchema,
  countryId: optionalIdSchema,
  displayName: z.string().trim().min(1, 'Name is required').max(120),
  email: z
    .union([z.string().trim().email(), z.literal('')])
    .transform((value) => (value === '' ? null : value)),
});

export type MemberProfileFieldsInput = z.input<typeof memberProfileFieldsSchema>;
export type MemberProfileFields = z.infer<typeof memberProfileFieldsSchema>;

export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export const ALLOWED_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedAvatarMimeType = (typeof ALLOWED_AVATAR_MIME_TYPES)[number];

export function isAllowedAvatarMimeType(
  mime: string,
): mime is AllowedAvatarMimeType {
  return (ALLOWED_AVATAR_MIME_TYPES as readonly string[]).includes(mime);
}

export function parseMemberProfileFormData(formData: FormData) {
  return memberProfileFieldsSchema.safeParse({
    bio: formData.get('bio'),
    cityId: formData.get('cityId'),
    countryId: formData.get('countryId'),
    displayName: formData.get('displayName'),
    email: formData.get('email'),
  });
}
