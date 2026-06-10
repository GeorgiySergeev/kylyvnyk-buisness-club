import { deriveCountryCodeFromPhone } from '@/lib/phone/derive-iso2-from-phone';

import type { CardMemberType } from '../../../db/schema/enums/card-status';

const CROCKFORD_BASE32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export { deriveCountryCodeFromPhone };

function getMemberTypePrefix(memberType: CardMemberType): string {
  if (memberType === 'BUSINESS') {
    return 'business';
  }

  if (memberType === 'VIP') {
    return 'vip';
  }

  return memberType;
}

export function shouldRotateCardNumber(
  currentMemberType: CardMemberType,
  nextMemberType: CardMemberType,
) {
  return currentMemberType !== nextMemberType;
}

export function generateCardEntropy(): string {
  const bytes = new Uint8Array(7);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  let value = BigInt(0);

  for (const byte of bytes) {
    value = value * BigInt(256) + BigInt(byte);
  }

  let encoded = '';

  for (let i = 0; i < 10; i++) {
    const index = Number(value % BigInt(32));
    encoded = CROCKFORD_BASE32_ALPHABET[index] + encoded;
    value = value / BigInt(32);
  }

  return encoded;
}

export function generateCardNumber(phone: string, memberType: CardMemberType): string {
  const country = deriveCountryCodeFromPhone(phone);
  return `${getMemberTypePrefix(memberType)}-${country}-${generateCardEntropy()}`;
}

export function deriveDefaultDisplayNameFromCardNumber(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length > 0) {
    return `user_${digits}`;
  }

  const suffix = cardNumber.split('-').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'member';
  return `user_${suffix}`;
}
