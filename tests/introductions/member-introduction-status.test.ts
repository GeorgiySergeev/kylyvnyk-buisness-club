import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getMemberStatusLabelKey,
  shouldShowMemberAdminNote,
} from '../../src/features/introductions/lib/member-introduction-status';

test('maps introduction statuses to member label keys', () => {
  assert.equal(getMemberStatusLabelKey('SUBMITTED'), 'statusSubmitted');
  assert.equal(getMemberStatusLabelKey('UNDER_REVIEW'), 'statusUnderReview');
  assert.equal(getMemberStatusLabelKey('APPROVED'), 'statusApproved');
  assert.equal(getMemberStatusLabelKey('REJECTED'), 'statusRejected');
  assert.equal(getMemberStatusLabelKey('CLOSED'), 'statusClosed');
});

test('shows admin note only for approved and rejected statuses', () => {
  assert.equal(shouldShowMemberAdminNote('SUBMITTED'), false);
  assert.equal(shouldShowMemberAdminNote('UNDER_REVIEW'), false);
  assert.equal(shouldShowMemberAdminNote('APPROVED'), true);
  assert.equal(shouldShowMemberAdminNote('REJECTED'), true);
  assert.equal(shouldShowMemberAdminNote('CLOSED'), false);
});
