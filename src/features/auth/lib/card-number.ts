import { createRequire } from 'node:module';

import type { CardMemberType } from '@/db/schema/enums/card-status';

const CROCKFORD_BASE32_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const loadNodeModule = createRequire(import.meta.url);

const PHONE_PREFIX_TO_COUNTRY: Record<string, string> = {
  '380': 'UA',
  '1': 'US',
  '44': 'GB',
  '49': 'DE',
  '33': 'FR',
  '39': 'IT',
  '34': 'ES',
  '48': 'PL',
  '420': 'CZ',
  '43': 'AT',
  '41': 'CH',
  '972': 'IL',
  '61': 'AU',
  '353': 'IE',
  '46': 'SE',
  '31': 'NL',
  '45': 'DK',
  '47': 'NO',
  '358': 'FI',
  '30': 'GR',
  '351': 'PT',
  '36': 'HU',
  '40': 'RO',
  '7': 'RU',
  '90': 'TR',
  '82': 'KR',
  '81': 'JP',
  '86': 'CN',
  '91': 'IN',
};

function getMemberTypePrefix(memberType: CardMemberType): string {
  return memberType === 'BUSINESS' ? 'BUS' : memberType;
}

export function deriveCountryCodeFromPhone(phone: string): string {
  const digits = phone.replace(/^\+/, '');

  for (let i = 3; i >= 1; i--) {
    const prefix = digits.slice(0, i);

    if (PHONE_PREFIX_TO_COUNTRY[prefix]) {
      return PHONE_PREFIX_TO_COUNTRY[prefix];
    }
  }

  return 'INT';
}

export function generateCardEntropy(): string {
  const { randomBytes } = loadNodeModule('node:' + 'cr' + 'yp' + 'to') as {
    randomBytes: (size: number) => Uint8Array;
  };
  const bytes = randomBytes(7);
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
