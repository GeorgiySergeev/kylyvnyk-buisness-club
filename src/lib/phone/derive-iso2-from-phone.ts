import { getCountryByDialPrefix } from './countries';

/** Derive lowercase ISO2 from an international phone string, or null if unknown. */
export function deriveIso2FromPhone(input: string): string | null {
  const trimmed = input.trim();
  const digits = trimmed.replace(/^\+/, '').replace(/\D/g, '');
  if (!digits) return null;

  const country = getCountryByDialPrefix(digits);
  return country?.iso2 ?? null;
}

/** Uppercase ISO2 for card numbers; falls back to INT when unknown. */
export function deriveCountryCodeFromPhone(phone: string): string {
  const iso2 = deriveIso2FromPhone(phone);
  if (!iso2) return 'INT';

  const base = iso2.split('-')[0];
  return base.toUpperCase();
}
