/* global globalThis */

export const DEV_PHONE_AUTH_COOKIE = 'kclub_dev_phone_auth';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getDevPhoneAuthSecret(): string | null {
  if (process.env.AUTH_DEV_PHONE_BYPASS_SECRET) {
    return process.env.AUTH_DEV_PHONE_BYPASS_SECRET;
  }

  if (process.env.NODE_ENV === 'test') {
    return 'kclub-test-dev-phone-cookie-secret';
  }

  return null;
}

function base64UrlEncode(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = `${value.replace(/-/g, '+').replace(/_/g, '/')}${'='.repeat(
    (4 - (value.length % 4)) % 4,
  )}`;
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function getWebHasher(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web HMAC API is unavailable.');
  }

  return subtle;
}

async function signDevPhoneAuthPayload(payload: string, secret: string): Promise<string> {
  const subtle = getWebHasher();
  const key = await subtle.importKey(
    'raw',
    encoder.encode(secret),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  );
  const signature = await subtle.sign('HMAC', key, encoder.encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }

  return diff === 0;
}

export async function encodeDevPhoneAuthCookie(phone: string): Promise<string> {
  const secret = getDevPhoneAuthSecret();

  if (!secret) {
    throw new Error('AUTH_DEV_PHONE_BYPASS_SECRET is required for dev phone auth cookies.');
  }

  const payload = base64UrlEncode(encoder.encode(phone));
  return `${payload}.${await signDevPhoneAuthPayload(payload, secret)}`;
}

export async function decodeDevPhoneAuthCookie(value: string | undefined): Promise<string | null> {
  if (!value) {
    return null;
  }

  try {
    const [payload, signature, ...extra] = value.split('.');
    const secret = getDevPhoneAuthSecret();

    if (!payload || !signature || extra.length > 0 || !secret) {
      return null;
    }

    const expected = await signDevPhoneAuthPayload(payload, secret);

    if (!constantTimeEqual(base64UrlDecode(signature), base64UrlDecode(expected))) {
      return null;
    }

    return decoder.decode(base64UrlDecode(payload));
  } catch {
    return null;
  }
}
