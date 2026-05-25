import { z } from 'zod';

const optionalMessageSchema = z
  .string()
  .trim()
  .max(500, 'Message must be 500 characters or less.')
  .optional()
  .or(z.literal('').transform(() => undefined));

export const introductionRequestSchema = z.object({
  clientContact: z
    .string()
    .trim()
    .min(5, 'Client contact is required.')
    .max(160, 'Client contact must be 160 characters or less.'),
  clientName: z
    .string()
    .trim()
    .min(2, 'Client name is required.')
    .max(120, 'Client name must be 120 characters or less.'),
  message: optionalMessageSchema,
  targetBusinessId: z.string().uuid('Select a valid business.'),
});

export type IntroductionRequestFormInput = z.input<typeof introductionRequestSchema>;
export type IntroductionRequestInput = z.infer<typeof introductionRequestSchema>;
