import { and, eq } from 'drizzle-orm';

import { introductions } from '@/db/schema';

import { setIntroductionStatusSchema } from '../schemas/introduction-moderation.schema';

type CurrentAdmin = { id: string };
type AuthResult = { data: CurrentAdmin; ok: true } | { error: string; ok: false };

type IntroductionRecord = {
  id: string;
  targetBusiness: {
    deletedAt: Date | null;
    id: string;
    status: string;
  } | null;
};

type UpdateResult = { id: string; status: string };

export type SetIntroductionStatusDeps = {
  createAuditLog: (input: {
    action: string;
    actorUserId: string;
    entityId: string;
    entityType: string;
    payload: Record<string, unknown>;
  }) => Promise<void>;
  findIntroduction: (introductionId: string) => Promise<IntroductionRecord | undefined>;
  getCurrentAdmin: () => Promise<AuthResult>;
  revalidate: () => void;
  updateIntroduction: (input: {
    adminNote: string | null;
    introductionId: string;
    status: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    targetBusinessId: string;
    updatedAt: Date;
  }) => Promise<UpdateResult | undefined>;
};

type ActionResult<T> = { data: T; ok: true } | { error: string; ok: false };

export function createSetIntroductionStatusHandler(deps: SetIntroductionStatusDeps) {
  return async function setIntroductionStatusHandler(
    rawInput: unknown,
  ): Promise<ActionResult<{ introductionId: string; status: string }>> {
    const admin = await deps.getCurrentAdmin();

    if (!admin.ok) {
      return { error: 'Unauthorized. Admin access required.', ok: false };
    }

    const parsed = setIntroductionStatusSchema.safeParse(rawInput);

    if (!parsed.success) {
      return {
        error: parsed.error.flatten().fieldErrors?.status?.[0] ?? 'Invalid input.',
        ok: false,
      };
    }

    const current = await deps.findIntroduction(parsed.data.introductionId);

    if (!current) {
      return { error: 'Introduction request not found.', ok: false };
    }

    if (
      !current.targetBusiness ||
      current.targetBusiness.status !== 'PUBLISHED' ||
      current.targetBusiness.deletedAt
    ) {
      return { error: 'Target business is no longer available for moderation.', ok: false };
    }

    const updated = await deps.updateIntroduction({
      adminNote: parsed.data.adminNote ?? null,
      introductionId: parsed.data.introductionId,
      status: parsed.data.status,
      targetBusinessId: current.targetBusiness.id,
      updatedAt: new Date(),
    });

    if (!updated) {
      return { error: 'Introduction request could not be updated.', ok: false };
    }

    await deps.createAuditLog({
      action: 'INTRODUCTION_STATUS_UPDATED',
      actorUserId: admin.data.id,
      entityId: updated.id,
      entityType: 'introduction',
      payload: {
        introductionId: updated.id,
        newStatus: updated.status,
      },
    });

    deps.revalidate();

    return {
      data: {
        introductionId: updated.id,
        status: updated.status,
      },
      ok: true,
    };
  };
}

export function createSetIntroductionStatusDbDeps(input: {
  createAuditLog: SetIntroductionStatusDeps['createAuditLog'];
  findIntroduction: SetIntroductionStatusDeps['findIntroduction'];
  getCurrentAdmin: SetIntroductionStatusDeps['getCurrentAdmin'];
  revalidate: SetIntroductionStatusDeps['revalidate'];
  updateIntroductionRow: (args: {
    adminNote: string | null;
    introductionId: string;
    status: 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    targetBusinessId: string;
    updatedAt: Date;
  }) => Promise<Array<{ id: string; status: string }>>;
}): SetIntroductionStatusDeps {
  return {
    createAuditLog: input.createAuditLog,
    findIntroduction: input.findIntroduction,
    getCurrentAdmin: input.getCurrentAdmin,
    revalidate: input.revalidate,
    updateIntroduction: async ({
      adminNote,
      introductionId,
      status,
      targetBusinessId,
      updatedAt,
    }) => {
      const rows = await input.updateIntroductionRow({
        adminNote,
        introductionId,
        status,
        targetBusinessId,
        updatedAt,
      });

      return rows[0];
    },
  };
}

export function buildIntroductionUpdateWhere(introductionId: string, targetBusinessId: string) {
  return and(
    eq(introductions.id, introductionId),
    eq(introductions.targetBusinessId, targetBusinessId),
  );
}
