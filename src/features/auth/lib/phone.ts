import { z } from 'zod';

const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

export function normalizePhoneNumber(input: string): string {
  const trimmed = input.trim();
  const prefixed = trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
  return prefixed.replace(/[^\d+]/g, '');
}

export const phoneNumberSchema = z
  .string()
  .trim()
  .min(1, 'Phone is required.')
  .transform(normalizePhoneNumber)
  .refine((value) => PHONE_PATTERN.test(value), {
    message: 'Enter a valid international phone number.',
  });

export const displayNameSchema = z.string().trim().min(1).max(80);

export const phoneOtpRequestSchema = z.object({
  captchaToken: z.string().trim().optional(),
  displayName: displayNameSchema.optional().or(z.literal('')),
  phone: phoneNumberSchema,
  returnBackUrl: z.string().trim().optional(),
});

export const phoneOtpVerifySchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code.'),
  phone: phoneNumberSchema,
  displayName: displayNameSchema.optional().or(z.literal('')),
  returnBackUrl: z.string().trim().optional(),
});

export type PhoneOtpRequestInput = z.input<typeof phoneOtpRequestSchema>;
export type PhoneOtpVerifyInput = z.input<typeof phoneOtpVerifySchema>;
