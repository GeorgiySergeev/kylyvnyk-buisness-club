import { z } from 'zod';

const optionalTrimmed = z.string().trim().optional().or(z.literal(''));

export const submitBusinessSchema = z.object({
  categoryId: z.coerce.number().int().positive('Category is required.'),
  cityId: z.coerce.number().int().positive('City is required.'),
  countryId: z.coerce.number().int().positive('Country is required.'),
  description: optionalTrimmed,
  email: z.string().trim().email('Enter a valid email address.'),
  name: z.string().trim().min(2, 'Business name is required.').max(120),
  phone: z.string().trim().min(8, 'Phone is required.').max(32),
  representativeName: z.string().trim().min(2, 'Representative name is required.').max(80),
  website: z
    .string()
    .trim()
    .url('Enter a valid website or social link.')
    .or(z.literal(''))
    .transform((value) => value || undefined)
    .optional(),
});

export type SubmitBusinessFormInput = z.input<typeof submitBusinessSchema>;
export type SubmitBusinessInput = z.infer<typeof submitBusinessSchema>;
