import { z } from 'zod';

const optionalIdSchema = z.coerce
  .number()
  .int()
  .positive()
  .optional()
  .or(z.literal('').transform(() => undefined));

const requiredCountryIdSchema = z.coerce
  .number()
  .int()
  .positive('Country is required.');

export const onboardingSchema = z.object({
  bio: z.string().trim().max(500).optional(),
  cityId: optionalIdSchema,
  countryId: requiredCountryIdSchema,
  displayName: z.string().trim().min(1, 'Name is required.').max(120),
});

export type OnboardingFormInput = z.input<typeof onboardingSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
