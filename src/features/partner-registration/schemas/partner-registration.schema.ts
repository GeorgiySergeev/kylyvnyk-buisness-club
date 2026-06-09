import { z } from 'zod';

const PHONE_ALLOWED_PATTERN = /^\+?[0-9\s\-()]+$/;
const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_LENGTH = 32;

export interface PartnerRegistrationValidationMessages {
  acceptLegalRequired: string;
  businessNameRequired: string;
  categoryRequired: string;
  cityRequired: string;
  confirmAuthorityRequired: string;
  countryRequired: string;
  emailInvalid: string;
  phoneRequired: string;
  representativeNameRequired: string;
  websiteRequired: string;
}

export function createPartnerRegistrationSchema(messages: PartnerRegistrationValidationMessages) {
  return z.object({
    acceptLegal: z.boolean().refine(Boolean, messages.acceptLegalRequired),
    businessName: z.string().trim().min(1, messages.businessNameRequired).max(120),
    captchaToken: z.string().trim().optional(),
    categoryId: z.coerce.number().int().positive(messages.categoryRequired),
    cityName: z.string().trim().min(1, messages.cityRequired).max(120),
    confirmAuthority: z.boolean().refine(Boolean, messages.confirmAuthorityRequired),
    countryId: z.coerce.number().int().positive(messages.countryRequired),
    email: z.string().trim().email(messages.emailInvalid),
    phone: z.string().trim().superRefine((value, context) => {
      if (!value) {
        context.addIssue({
          code: 'custom',
          message: messages.phoneRequired,
        });
        return;
      }

      const digitCount = value.replace(/\D/g, '').length;

      if (
        value.length > PHONE_MAX_LENGTH ||
        digitCount < PHONE_MIN_DIGITS ||
        !PHONE_ALLOWED_PATTERN.test(value)
      ) {
        context.addIssue({
          code: 'custom',
          message: messages.phoneRequired,
        });
      }
    }),
    representativeName: z.string().trim().min(1, messages.representativeNameRequired).max(120),
    websiteOrSocial: z.string().trim().superRefine((value, context) => {
      if (!value) {
        context.addIssue({
          code: 'custom',
          message: messages.websiteRequired,
        });
        return;
      }

      if (!URL.canParse(value)) {
        context.addIssue({
          code: 'custom',
          message: messages.websiteRequired,
        });
      }
    }),
  });
}

export type PartnerRegistrationFormInput = z.input<ReturnType<typeof createPartnerRegistrationSchema>>;
export type PartnerRegistrationInput = z.infer<ReturnType<typeof createPartnerRegistrationSchema>>;
