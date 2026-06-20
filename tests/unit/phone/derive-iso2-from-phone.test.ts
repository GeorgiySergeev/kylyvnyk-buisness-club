import assert from 'node:assert/strict';
import { describe, it } from 'vitest';

import {
  deriveCountryCodeFromPhone,
  generateCardNumber,
} from '../../../src/features/auth/lib/card-number';
import { getCountryByDialPrefix } from '../../../src/lib/phone/countries';
import {
  deriveCountryCodeFromPhone as deriveCountryCodeFromPhoneLib,
  deriveIso2FromPhone,
} from '../../../src/lib/phone/derive-iso2-from-phone';

describe('deriveIso2FromPhone', () => {
  it('maps Ukrainian numbers to ua', () => {
    assert.equal(deriveIso2FromPhone('+380501234567'), 'ua');
  });

  it('maps US numbers to us', () => {
    assert.equal(deriveIso2FromPhone('+15550000001'), 'us');
  });

  it('returns null for unknown prefixes', () => {
    assert.equal(deriveIso2FromPhone('+999123456789'), null);
  });

  it('uses longest dial prefix match for Czech numbers', () => {
    assert.equal(deriveIso2FromPhone('+420123456789'), 'cz');
    assert.equal(getCountryByDialPrefix('420')?.iso2, 'cz');
  });
});

describe('deriveCountryCodeFromPhone regression', () => {
  it('returns uppercase ISO2 for card numbers', () => {
    assert.equal(deriveCountryCodeFromPhoneLib('+380501234567'), 'UA');
    assert.equal(deriveCountryCodeFromPhoneLib('+15550000001'), 'US');
    assert.equal(deriveCountryCodeFromPhoneLib('+999123456789'), 'INT');
  });

  it('matches card-number re-export', () => {
    assert.equal(deriveCountryCodeFromPhone('+380501234567'), 'UA');
    assert.equal(deriveCountryCodeFromPhone('+999123456789'), 'INT');
  });

  it('generates card numbers with derived country segment', () => {
    const number = generateCardNumber('+1 555 000 0001', 'BUSINESS');
    assert.match(number, /^business-US-[0-9A-HJKMNP-TV-Z]{10}$/);
  });
});
