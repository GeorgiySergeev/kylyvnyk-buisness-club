import { beforeEach, describe, expect, it, vi } from 'vitest';

const findFirstMock = vi.fn();
const insertMock = vi.fn();
const getAuthIdentityMock = vi.fn();
const checkPartnerRegistrationRateLimitMock = vi.fn();
const verifyTurnstileTokenMock = vi.fn();
const createAuditLogMock = vi.fn();

vi.mock('server-only', () => ({}));

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => ({
    get: (name: string) => (name === 'x-forwarded-for' ? '203.0.113.10' : null),
  })),
}));

vi.mock('@/db/client', () => ({
  db: {
    insert: insertMock,
    query: {
      businessApplications: {
        findFirst: findFirstMock,
      },
    },
  },
}));

vi.mock('@/features/auth/lib/auth-identity', () => ({
  getAuthIdentity: getAuthIdentityMock,
}));

vi.mock('@/lib/rate-limit/upstash', () => ({
  checkPartnerRegistrationRateLimit: checkPartnerRegistrationRateLimitMock,
}));

vi.mock('@/lib/captcha/turnstile', () => ({
  verifyTurnstileToken: verifyTurnstileTokenMock,
}));

vi.mock('@/lib/audit', () => ({
  createAuditLog: createAuditLogMock,
}));

vi.mock('@/lib/i18n/t-server', () => ({
  getT: () => (key: string) => key,
}));

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

describe('submitPartnerRegistrationAction', () => {
  beforeEach(() => {
    vi.resetModules();
    findFirstMock.mockReset();
    insertMock.mockReset();
    getAuthIdentityMock.mockReset();
    checkPartnerRegistrationRateLimitMock.mockReset();
    verifyTurnstileTokenMock.mockReset();
    createAuditLogMock.mockReset();

    checkPartnerRegistrationRateLimitMock.mockResolvedValue({ success: true });
    verifyTurnstileTokenMock.mockResolvedValue(true);
    findFirstMock.mockResolvedValue(null);
    getAuthIdentityMock.mockResolvedValue(null);
    createAuditLogMock.mockResolvedValue(undefined);
    insertMock.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 'app-123' }]),
      }),
    });
  });

  it('stores a valid public partner application as UNDER_REVIEW', async () => {
    const { submitPartnerRegistrationAction } = await import(
      '../../../src/features/partner-registration/actions/submit-partner-registration.action'
    );

    const result = await submitPartnerRegistrationAction('en', validInput);

    expect(result).toEqual({
      data: { applicationId: 'app-123', status: 'UNDER_REVIEW' },
      ok: true,
    });
    expect(createAuditLogMock).toHaveBeenCalledOnce();
  });

  it('returns a validation error for invalid input', async () => {
    const { submitPartnerRegistrationAction } = await import(
      '../../../src/features/partner-registration/actions/submit-partner-registration.action'
    );

    const result = await submitPartnerRegistrationAction('en', {
      ...validInput,
      email: 'not-an-email',
    });

    expect(result).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        fieldErrors: expect.objectContaining({
          email: ['errorEmail'],
        }),
        message: 'formError',
      },
      ok: false,
    });
  });

  it('returns a validation error for malformed phone input before side effects', async () => {
    const { submitPartnerRegistrationAction } = await import(
      '../../../src/features/partner-registration/actions/submit-partner-registration.action'
    );

    const result = await submitPartnerRegistrationAction('en', {
      ...validInput,
      phone: '+3575689865565+6',
    });

    expect(result).toEqual({
      error: {
        code: 'VALIDATION_ERROR',
        fieldErrors: expect.objectContaining({
          phone: ['errorPhone'],
        }),
        message: 'formError',
      },
      ok: false,
    });
    expect(checkPartnerRegistrationRateLimitMock).not.toHaveBeenCalled();
    expect(verifyTurnstileTokenMock).not.toHaveBeenCalled();
    expect(findFirstMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
    expect(createAuditLogMock).not.toHaveBeenCalled();
  });

  it('returns a server error when an unexpected dependency throws', async () => {
    getAuthIdentityMock.mockRejectedValue(new Error('Supabase unavailable'));

    const { submitPartnerRegistrationAction } = await import(
      '../../../src/features/partner-registration/actions/submit-partner-registration.action'
    );

    const result = await submitPartnerRegistrationAction('en', validInput);

    expect(result).toEqual({
      error: {
        code: 'SERVER_ERROR',
        message: 'serverError',
      },
      ok: false,
    });
  });
});
