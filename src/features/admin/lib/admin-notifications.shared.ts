import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';

export type AdminNotificationEntityType = 'business' | 'business_application' | 'introduction';

export interface AdminNotification {
  entityId: string;
  entityType: AdminNotificationEntityType;
  href: string;
  id: string;
  status: string;
  subtitle: string | null;
  timestamp: string;
  title: string;
}

export interface PendingBusinessNotificationRow {
  createdAt: Date;
  id: string;
  name: string;
  ownerName: string | null;
  status: string;
}

export interface PendingBusinessApplicationNotificationRow {
  createdAt: Date;
  id: string;
  representativeName: string | null;
  status: string;
  title: string;
}

export interface PendingIntroductionNotificationRow {
  clientName: string;
  createdAt: Date;
  id: string;
  requesterName: string | null;
  status: string;
  targetBusinessName: string | null;
}

export interface AdminNotificationSourceRows {
  applications?: PendingBusinessApplicationNotificationRow[];
  businesses: PendingBusinessNotificationRow[];
  introductions: PendingIntroductionNotificationRow[];
}

function toTimestampValue(timestamp: string): number {
  return Number.isNaN(Date.parse(timestamp)) ? 0 : Date.parse(timestamp);
}

export function buildAdminNotifications(
  locale: SupportedLocale,
  rows: AdminNotificationSourceRows,
): AdminNotification[] {
  const businessNotifications: AdminNotification[] = rows.businesses.map((business) => ({
    entityId: business.id,
    entityType: 'business',
    href: localizeHref(locale, `/admin/businesses/${business.id}`),
    id: `business:${business.id}`,
    status: business.status,
    subtitle: business.ownerName,
    timestamp: business.createdAt.toISOString(),
    title: business.name,
  }));

  const applicationNotifications: AdminNotification[] = (rows.applications ?? []).map((application) => ({
    entityId: application.id,
    entityType: 'business_application',
    href: localizeHref(locale, '/admin/businesses'),
    id: `business-application:${application.id}`,
    status: application.status,
    subtitle: application.representativeName,
    timestamp: application.createdAt.toISOString(),
    title: application.title,
  }));

  const introductionNotifications: AdminNotification[] = rows.introductions.map((introduction) => ({
    entityId: introduction.id,
    entityType: 'introduction',
    href: localizeHref(locale, `/admin/introductions/${introduction.id}`),
    id: `introduction:${introduction.id}`,
    status: introduction.status,
    subtitle: introduction.targetBusinessName ?? introduction.requesterName,
    timestamp: introduction.createdAt.toISOString(),
    title: introduction.clientName,
  }));

  return [...applicationNotifications, ...businessNotifications, ...introductionNotifications].sort(
    (left, right) => toTimestampValue(right.timestamp) - toTimestampValue(left.timestamp),
  );
}
