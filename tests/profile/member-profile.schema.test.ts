import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isAllowedAvatarMimeType,
  memberProfileFieldsSchema,
  parseMemberProfileFormData,
} from '../../src/features/profile/schemas/member-profile.schema';

test('memberProfileFieldsSchema accepts valid profile fields', () => {
  const result = memberProfileFieldsSchema.safeParse({
    bio: 'Club member',
    cityId: '2',
    countryId: '1',
    displayName: 'Alex Kylyvnyk',
    email: 'alex@example.com',
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.displayName, 'Alex Kylyvnyk');
    assert.equal(result.data.email, 'alex@example.com');
    assert.equal(result.data.countryId, 1);
    assert.equal(result.data.cityId, 2);
    assert.equal(result.data.bio, 'Club member');
  }
});

test('memberProfileFieldsSchema maps empty email to null', () => {
  const result = memberProfileFieldsSchema.safeParse({
    displayName: 'Alex',
    email: '',
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.email, null);
  }
});

test('memberProfileFieldsSchema rejects invalid email', () => {
  const result = memberProfileFieldsSchema.safeParse({
    displayName: 'Alex',
    email: 'not-an-email',
  });

  assert.equal(result.success, false);
});

test('memberProfileFieldsSchema rejects bio over 500 characters', () => {
  const result = memberProfileFieldsSchema.safeParse({
    bio: 'a'.repeat(501),
    displayName: 'Alex',
    email: '',
  });

  assert.equal(result.success, false);
});

test('parseMemberProfileFormData parses FormData entries', () => {
  const formData = new FormData();
  formData.set('displayName', 'Member');
  formData.set('email', 'member@example.com');
  formData.set('countryId', '3');
  formData.set('cityId', '');
  formData.set('bio', '');

  const result = parseMemberProfileFormData(formData);
  assert.equal(result.success, true);
});

test('isAllowedAvatarMimeType allows supported image types', () => {
  assert.equal(isAllowedAvatarMimeType('image/png'), true);
  assert.equal(isAllowedAvatarMimeType('image/jpeg'), true);
});

test('isAllowedAvatarMimeType rejects unsupported types', () => {
  assert.equal(isAllowedAvatarMimeType('application/pdf'), false);
});
