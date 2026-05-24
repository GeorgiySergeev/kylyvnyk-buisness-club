import { z } from 'zod';

const optionalIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .optional()
  .or(z.literal('').transform(() => undefined));

export const onboardingSchema = z.object({
  bio: z.string().trim().max(500).optional(),
  cityId: optionalIdSchema,
  countryId: optionalIdSchema,
  displayName: z
    .string()
    .trim()
    .max(80)
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

export type OnboardingFormInput = z.input<typeof onboardingSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
