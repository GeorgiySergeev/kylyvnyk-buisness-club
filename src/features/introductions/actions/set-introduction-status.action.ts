'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db/client';
import { introductions } from '@/db/schema';
import { getCurrentUserWithRole } from '@/features/auth/lib/current-user';
import { createAuditLog } from '@/lib/audit';

import {
  buildIntroductionUpdateWhere,
  createSetIntroductionStatusHandler,
} from './set-introduction-status.logic';

export const setIntroductionStatusAction = createSetIntroductionStatusHandler({
  createAuditLog,
  findIntroduction: async (introductionId) =>
    db.query.introductions.findFirst({
      columns: {
        id: true,
      },
      where: eq(introductions.id, introductionId),
      with: {
        targetBusiness: {
          columns: {
            deletedAt: true,
            id: true,
            status: true,
          },
        },
      },
    }),
  getCurrentAdmin: async () => getCurrentUserWithRole('ADMIN'),
  revalidate: () => {
    revalidatePath('/en/admin/introductions');
    revalidatePath('/en/m/introduce');
  },
  updateIntroduction: async ({ adminNote, introductionId, status, targetBusinessId, updatedAt }) => {
    const rows = await db
      .update(introductions)
      .set({
        adminNote,
        status,
        updatedAt,
      })
      .where(buildIntroductionUpdateWhere(introductionId, targetBusinessId))
      .returning({
        id: introductions.id,
        status: introductions.status,
      });

    return rows[0];
  },
});
