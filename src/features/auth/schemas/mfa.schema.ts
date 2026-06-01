import { z } from 'zod';

export const mfaTotpVerifySchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code.'),
  factorId: z.string().trim().min(1, 'MFA factor is required.'),
});

export type MfaTotpVerifyInput = z.input<typeof mfaTotpVerifySchema>;
