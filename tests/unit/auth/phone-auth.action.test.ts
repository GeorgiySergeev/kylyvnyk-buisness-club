import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const findExistingUserByPhoneMock = vi.fn();
const checkSmsOtpRateLimitMock = vi.fn();
const verifyTurnstileTokenMock = vi.fn();
const signInWithOtpMock = vi.fn();
const verifyOtpMock = vi.fn();
const signOutMock = vi.fn();
const getAuthIdentityMock = vi.fn();
const claimPreApprovedUserMock = vi.fn();
const resolvePostAuthRedirectMock = vi.fn();
const isAuthDevPhoneBypassEnabledMock = vi.fn();
const cookiesSetMock = vi.fn();
const cookiesDeleteMock = vi.fn();

vi.mock('server-only', () => ({}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    delete: cookiesDeleteMock,
    set: cookiesSetMock,
  })),
  headers: vi.fn(async () => ({
    get: (name: string) => (name === 'x-forwarded-for' ? '203.0.113.10' : null),
  })),
}));

vi.mock('@/features/auth/lib/current-user', () => ({
  findExistingUserByPhone: findExistingUserByPhoneMock,
}));

vi.mock('@/lib/rate-limit/upstash', () => ({
  checkSmsOtpRateLimit: checkSmsOtpRateLimitMock,
}));

vi.mock('@/lib/captcha/turnstile', () => ({
  verifyTurnstileToken: verifyTurnstileTokenMock,
}));

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: vi.fn(async () => ({
    auth: {
      signInWithOtp: signInWithOtpMock,
      signOut: signOutMock,
      verifyOtp: verifyOtpMock,
    },
  })),
}));

vi.mock('@/features/auth/lib/auth-identity', () => ({
  getAuthIdentity: getAuthIdentityMock,
  isAuthDevPhoneBypassEnabled: isAuthDevPhoneBypassEnabledMock,
}));

vi.mock('@/features/auth/lib/claim-pre-approved-user', () => ({
  claimPreApprovedUser: claimPreApprovedUserMock,
}));

vi.mock('@/features/auth/lib/resolve-post-auth-redirect', () => ({
  resolvePostAuthRedirect: resolvePostAuthRedirectMock,
}));

vi.mock('@/lib/i18n/t-server', () => ({
  getT: () => (key: string) => key,
}));

const preApprovedUser = {
  id: 'user-1',
  phone: '+380501234567',
  status: 'ACTIVE',
  supabaseUserId: null,
};

describe('phone auth actions', () => {
  beforeEach(() => {
    vi.resetModules();
    findExistingUserByPhoneMock.mockReset();
    checkSmsOtpRateLimitMock.mockReset();
    verifyTurnstileTokenMock.mockReset();
    signInWithOtpMock.mockReset();
    verifyOtpMock.mockReset();
    signOutMock.mockReset();
    getAuthIdentityMock.mockReset();
    claimPreApprovedUserMock.mockReset();
    resolvePostAuthRedirectMock.mockReset();
    isAuthDevPhoneBypassEnabledMock.mockReset();
    cookiesSetMock.mockReset();
    cookiesDeleteMock.mockReset();

    checkSmsOtpRateLimitMock.mockResolvedValue({ success: true, limit: 3, remaining: 2, reset: 0 });
    verifyTurnstileTokenMock.mockResolvedValue(true);
    signInWithOtpMock.mockResolvedValue({ error: null });
    verifyOtpMock.mockResolvedValue({ error: null });
    signOutMock.mockResolvedValue({ error: null });
    resolvePostAuthRedirectMock.mockResolvedValue('/en/m/dashboard');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('blocks OTP requests for unknown phones on sign-in and sign-up claim', async () => {
    findExistingUserByPhoneMock.mockResolvedValue(null);
    const { requestPhoneOtpAction } = await import(
      '../../../src/features/auth/actions/phone-auth.action'
    );

    for (const intent of ['sign-in', 'sign-up'] as const) {
      const result = await requestPhoneOtpAction('en', intent, {
        phone: '+380501234567',
        captchaToken: 'token',
      });

      expect(result).toEqual({
        error: {
          code: 'ACCOUNT_NOT_APPROVED',
          message: 'phoneAuthAccountNotApproved',
        },
        ok: false,
      });
    }

    expect(signInWithOtpMock).not.toHaveBeenCalled();
  });

  it('sends OTP with shouldCreateUser true for phone-only pre-approved users', async () => {
    findExistingUserByPhoneMock.mockResolvedValue(preApprovedUser);
    const { requestPhoneOtpAction } = await import(
      '../../../src/features/auth/actions/phone-auth.action'
    );

    const result = await requestPhoneOtpAction('en', 'sign-in', {
      phone: '+380501234567',
      captchaToken: 'token',
    });

    expect(result).toEqual({
      data: { phone: '+380501234567' },
      ok: true,
    });
    expect(signInWithOtpMock).toHaveBeenCalledWith({
      phone: '+380501234567',
      options: { shouldCreateUser: true },
    });
  });

  it('sends OTP with shouldCreateUser false for already linked users', async () => {
    findExistingUserByPhoneMock.mockResolvedValue({
      ...preApprovedUser,
      supabaseUserId: 'supabase-user-1',
    });
    const { requestPhoneOtpAction } = await import(
      '../../../src/features/auth/actions/phone-auth.action'
    );

    await requestPhoneOtpAction('en', 'sign-in', {
      phone: '+380501234567',
      captchaToken: 'token',
    });

    expect(signInWithOtpMock).toHaveBeenCalledWith({
      phone: '+380501234567',
      options: { shouldCreateUser: false },
    });
  });

  it('maps rate-limit and captcha failures to typed errors', async () => {
    findExistingUserByPhoneMock.mockResolvedValue(preApprovedUser);
    const { requestPhoneOtpAction } = await import(
      '../../../src/features/auth/actions/phone-auth.action'
    );

    checkSmsOtpRateLimitMock.mockResolvedValueOnce({ success: false, limit: 3, remaining: 0, reset: 0 });
    const rateLimited = await requestPhoneOtpAction('en', 'sign-in', {
      phone: '+380501234567',
      captchaToken: 'token',
    });
    expect(rateLimited).toEqual({
      error: { code: 'RATE_LIMITED', message: 'phoneAuthRateLimitError' },
      ok: false,
    });

    verifyTurnstileTokenMock.mockResolvedValueOnce(false);
    const captchaFailed = await requestPhoneOtpAction('en', 'sign-in', {
      phone: '+380501234567',
      captchaToken: 'token',
    });
    expect(captchaFailed).toEqual({
      error: { code: 'CAPTCHA_FAILED', message: 'phoneAuthCaptchaError' },
      ok: false,
    });
  });

  it('maps OTP send failures to OTP_SEND_FAILED', async () => {
    findExistingUserByPhoneMock.mockResolvedValue(preApprovedUser);
    signInWithOtpMock.mockResolvedValueOnce({ error: { message: 'provider down' } });
    const { requestPhoneOtpAction } = await import(
      '../../../src/features/auth/actions/phone-auth.action'
    );

    const result = await requestPhoneOtpAction('en', 'sign-in', {
      phone: '+380501234567',
      captchaToken: 'token',
    });

    expect(result).toEqual({
      error: { code: 'OTP_SEND_FAILED', message: 'phoneAuthOtpSendFailed' },
      ok: false,
    });
  });

  it('claims a pre-approved user after OTP verification', async () => {
    getAuthIdentityMock.mockResolvedValue({
      devBypass: false,
      phone: '+380501234567',
      providerUserId: 'supabase-user-1',
    });
    claimPreApprovedUserMock.mockResolvedValue({
      linked: true,
      ok: true,
      user: { ...preApprovedUser, supabaseUserId: 'supabase-user-1' },
    });

    const { verifyPhoneOtpAction } = await import(
      '../../../src/features/auth/actions/phone-auth.action'
    );

    const result = await verifyPhoneOtpAction('en', 'sign-in', {
      phone: '+380501234567',
      code: '123456',
    });

    expect(result).toEqual({
      data: { redirectTo: '/en/m/dashboard' },
      ok: true,
    });
    expect(claimPreApprovedUserMock).toHaveBeenCalled();
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it('signs out and returns ACCOUNT_NOT_APPROVED when claim fails', async () => {
    getAuthIdentityMock.mockResolvedValue({
      devBypass: false,
      phone: '+380501234567',
      providerUserId: 'supabase-user-1',
    });
    claimPreApprovedUserMock.mockResolvedValue({ ok: false, reason: 'INACTIVE' });

    const { verifyPhoneOtpAction } = await import(
      '../../../src/features/auth/actions/phone-auth.action'
    );

    const result = await verifyPhoneOtpAction('en', 'sign-in', {
      phone: '+380501234567',
      code: '123456',
    });

    expect(result).toEqual({
      error: {
        code: 'ACCOUNT_NOT_APPROVED',
        message: 'phoneAuthAccountNotApproved',
      },
      ok: false,
    });
    expect(signOutMock).toHaveBeenCalled();
  });

  it('does not mutate app state when OTP verification fails', async () => {
    verifyOtpMock.mockResolvedValueOnce({ error: { message: 'invalid code' } });
    const { verifyPhoneOtpAction } = await import(
      '../../../src/features/auth/actions/phone-auth.action'
    );

    const result = await verifyPhoneOtpAction('en', 'sign-in', {
      phone: '+380501234567',
      code: '123456',
    });

    expect(result).toEqual({
      error: { code: 'OTP_VERIFY_FAILED', message: 'phoneAuthOtpVerifyFailed' },
      ok: false,
    });
    expect(claimPreApprovedUserMock).not.toHaveBeenCalled();
  });

  it('keeps dev bypass non-production and claim-only', async () => {
    isAuthDevPhoneBypassEnabledMock.mockReturnValue(false);
    const { devBypassPhoneAuthAction } = await import(
      '../../../src/features/auth/actions/phone-auth.action'
    );

    const disabled = await devBypassPhoneAuthAction('en', 'sign-in', {
      phone: '+380501234567',
    });
    expect(disabled).toEqual({
      error: { code: 'DEV_BYPASS_DISABLED', message: 'Development phone bypass is disabled.' },
      ok: false,
    });

    isAuthDevPhoneBypassEnabledMock.mockReturnValue(true);
    findExistingUserByPhoneMock.mockResolvedValue(preApprovedUser);
    claimPreApprovedUserMock.mockResolvedValue({
      linked: true,
      ok: true,
      user: { ...preApprovedUser, supabaseUserId: 'dev:+380501234567' },
    });

    const enabled = await devBypassPhoneAuthAction('en', 'sign-up', {
      phone: '+380501234567',
    });

    expect(enabled).toEqual({
      data: { redirectTo: '/en/m/dashboard' },
      ok: true,
    });
    expect(claimPreApprovedUserMock).toHaveBeenCalledWith({
      devBypass: true,
      phone: '+380501234567',
      providerUserId: 'dev:+380501234567',
    });
  });
});
