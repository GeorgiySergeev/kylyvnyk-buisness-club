import { z } from 'zod';

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
    phone: z.string().trim().min(1, messages.phoneRequired).max(32),
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
