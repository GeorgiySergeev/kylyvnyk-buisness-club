import { describe, expect, it } from 'vitest';

import { VERIFY_CARD_METADATA } from '../../../src/features/cards/lib/verify-card-metadata';

describe('verify-card metadata contract', () => {
  it('forces noindex and nofollow for public verify-card surfaces', () => {
    expect(VERIFY_CARD_METADATA.robots).toEqual({
      follow: false,
      index: false,
    });
  });
});
