import assert from 'node:assert/strict';
import { test } from 'vitest';

import { createSetIntroductionStatusHandler } from '../../../src/features/introductions/actions/set-introduction-status.logic';

const validInput = {
  adminNote: 'Approved after partner verification.',
  introductionId: 'da2f7e4d-9f0f-4718-8fd2-bca5acd9d71e',
  status: 'APPROVED',
} as const;

test('rejects non-admin context', async () => {
  const handler = createSetIntroductionStatusHandler({
    createAuditLog: async () => undefined,
    findIntroduction: async () => undefined,
    getCurrentAdmin: async () => ({ error: 'FORBIDDEN', ok: false }),
    revalidate: () => undefined,
    updateIntroduction: async () => undefined,
  });

  const result = await handler(validInput);

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, 'Unauthorized. Admin access required.');
  }
});

test('rejects missing introduction', async () => {
  const handler = createSetIntroductionStatusHandler({
    createAuditLog: async () => undefined,
    findIntroduction: async () => undefined,
    getCurrentAdmin: async () => ({ data: { id: 'admin-1' }, ok: true }),
    revalidate: () => undefined,
    updateIntroduction: async () => undefined,
  });

  const result = await handler(validInput);

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error, 'Introduction request not found.');
  }
});

test('updates status and writes expected audit action', async () => {
  let auditAction = '';
  let auditStatus = '';

  const handler = createSetIntroductionStatusHandler({
    createAuditLog: async (input) => {
      auditAction = input.action;
      auditStatus = String(input.payload.newStatus);
    },
    findIntroduction: async () => ({
      id: validInput.introductionId,
      targetBusiness: {
        deletedAt: null,
        id: 'business-1',
        status: 'PUBLISHED',
      },
    }),
    getCurrentAdmin: async () => ({ data: { id: 'admin-42' }, ok: true }),
    revalidate: () => undefined,
    updateIntroduction: async () => ({
      id: validInput.introductionId,
      status: 'APPROVED',
    }),
  });

  const result = await handler(validInput);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.introductionId, validInput.introductionId);
    assert.equal(result.data.status, 'APPROVED');
  }
  assert.equal(auditAction, 'INTRODUCTION_STATUS_UPDATED');
  assert.equal(auditStatus, 'APPROVED');
});
