import { z } from 'zod';

export const introductionModerationStatusSchema = z.enum([
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
]);

export const setIntroductionStatusSchema = z.object({
  adminNote: z
    .string()
    .trim()
    .max(500, 'Admin note must be 500 characters or less.')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  introductionId: z.string().uuid('Invalid introduction id.'),
  status: introductionModerationStatusSchema,
});

export type SetIntroductionStatusInput = z.infer<typeof setIntroductionStatusSchema>;
