import assert from 'node:assert/strict';
import { describe, it } from 'vitest';

import {
  createPartnerRegistrationSchema,
  type PartnerRegistrationValidationMessages,
} from '../../../src/features/partner-registration/schemas/partner-registration.schema';

const messages: PartnerRegistrationValidationMessages = {
  acceptLegalRequired: 'Accept legal.',
  businessNameRequired: 'Business name.',
  categoryRequired: 'Category.',
  cityRequired: 'City.',
  confirmAuthorityRequired: 'Authority.',
  countryRequired: 'Country.',
  emailInvalid: 'Email.',
  phoneRequired: 'Phone.',
  representativeNameRequired: 'Representative.',
  websiteRequired: 'Website.',
};

const schema = createPartnerRegistrationSchema(messages);

const validInput = {
  acceptLegal: true,
  businessName: 'Acme Studio',
  captchaToken: 'XXXX.dummy.token.XXXX',
  categoryId: 1,
  cityName: 'Warsaw',
  confirmAuthority: true,
  countryId: 2,
  email: 'hello@acme.test',
  phone: '+15550000001',
  representativeName: 'Ada Lovelace',
  websiteOrSocial: 'https://acme.test',
};

describe('partner registration schema', () => {
  it('accepts a valid public partner application', () => {
    const parsed = schema.safeParse(validInput);

    assert.equal(parsed.success, true);
  });

  it('returns required field errors for the first step', () => {
    const parsed = schema.safeParse({
      ...validInput,
      businessName: '',
      categoryId: '',
    });

    assert.equal(parsed.success, false);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      assert.deepEqual(fields.businessName, [messages.businessNameRequired]);
      assert.deepEqual(fields.categoryId, [messages.categoryRequired]);
    }
  });

  it('returns contact and consent errors', () => {
    const parsed = schema.safeParse({
      ...validInput,
      acceptLegal: false,
      confirmAuthority: false,
      email: 'not-an-email',
      phone: '',
      representativeName: '',
    });

    assert.equal(parsed.success, false);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      assert.deepEqual(fields.acceptLegal, [messages.acceptLegalRequired]);
      assert.deepEqual(fields.confirmAuthority, [messages.confirmAuthorityRequired]);
      assert.deepEqual(fields.email, [messages.emailInvalid]);
      assert.deepEqual(fields.phone, [messages.phoneRequired]);
      assert.deepEqual(fields.representativeName, [messages.representativeNameRequired]);
    }
  });

  it('returns location errors', () => {
    const parsed = schema.safeParse({
      ...validInput,
      cityName: '',
      countryId: '',
      websiteOrSocial: '',
    });

    assert.equal(parsed.success, false);
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      assert.deepEqual(fields.cityName, [messages.cityRequired]);
      assert.deepEqual(fields.countryId, [messages.countryRequired]);
      assert.deepEqual(fields.websiteOrSocial, [messages.websiteRequired]);
    }
  });
});
