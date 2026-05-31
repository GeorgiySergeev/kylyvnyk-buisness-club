'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { localizeHref, SUPPORTED_LOCALES } from '@/components/layout/navigation';
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
  revalidate: (introductionId) => {
    SUPPORTED_LOCALES.forEach((locale) => {
      revalidatePath(localizeHref(locale, '/admin/introductions'));
      revalidatePath(localizeHref(locale, `/admin/introductions/${introductionId}`));
      revalidatePath(localizeHref(locale, '/m/introduce'));
    });
  },
  updateIntroduction: async ({
    adminNote,
    introductionId,
    status,
    targetBusinessId,
    updatedAt,
  }) => {
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
