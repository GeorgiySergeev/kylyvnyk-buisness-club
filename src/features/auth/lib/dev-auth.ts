export const DEV_PHONE_AUTH_COOKIE = 'kclub_dev_phone_auth';

export function encodeDevPhoneAuthCookie(phone: string): string {
  return Buffer.from(phone, 'utf8').toString('base64url');
}

export function decodeDevPhoneAuthCookie(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    return Buffer.from(value, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}
