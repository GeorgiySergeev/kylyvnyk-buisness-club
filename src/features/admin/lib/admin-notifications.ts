import 'server-only';

import { and, desc, eq, inArray, isNull } from 'drizzle-orm';

import type { SupportedLocale } from '@/components/layout/navigation';
import { type DB,db } from '@/db/client';
import { businesses, introductions } from '@/db/schema';

import {
  type AdminNotification,
  type AdminNotificationSourceRows,
  buildAdminNotifications,
} from './admin-notifications.shared';

export async function fetchAdminNotificationRows(database: DB = db): Promise<AdminNotificationSourceRows> {
  const [pendingBusinesses, pendingIntroductions] = await Promise.all([
    database.query.businesses.findMany({
      columns: {
        createdAt: true,
        id: true,
        name: true,
        status: true,
      },
      orderBy: [desc(businesses.createdAt)],
      where: and(eq(businesses.status, 'PENDING'), isNull(businesses.deletedAt)),
      with: {
        user: {
          columns: {
            displayName: true,
          },
        },
      },
    }),
    database.query.introductions.findMany({
      columns: {
        clientName: true,
        createdAt: true,
        id: true,
        status: true,
      },
      orderBy: [desc(introductions.createdAt)],
      where: inArray(introductions.status, ['SUBMITTED', 'UNDER_REVIEW']),
      with: {
        requester: {
          columns: {
            displayName: true,
          },
        },
        targetBusiness: {
          columns: {
            name: true,
          },
        },
      },
    }),
  ]);

  return {
    businesses: pendingBusinesses.map((business) => ({
      createdAt: business.createdAt,
      id: business.id,
      name: business.name,
      ownerName: business.user?.displayName ?? null,
      status: business.status,
    })),
    introductions: pendingIntroductions.map((introduction) => ({
      clientName: introduction.clientName,
      createdAt: introduction.createdAt,
      id: introduction.id,
      requesterName: introduction.requester?.displayName ?? null,
      status: introduction.status,
      targetBusinessName: introduction.targetBusiness?.name ?? null,
    })),
  };
}

export async function getAdminNotifications(
  locale: SupportedLocale,
  database: DB = db,
): Promise<AdminNotification[]> {
  const rows = await fetchAdminNotificationRows(database);
  return buildAdminNotifications(locale, rows);
}
