'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { AdminNotification } from '@/features/admin/lib/admin-notifications.shared';

export interface AdminNotificationsMenuLabels {
  adminSearchTypeBusiness: string;
  adminSearchTypeIntroduction: string;
  notifications: string;
  notificationsEmpty: string;
  notificationsNeedsReview: string;
  notificationsTitle: string;
}

interface AdminNotificationsMenuProps {
  labels: AdminNotificationsMenuLabels;
  notifications: AdminNotification[];
}

function getEntityLabel(
  entityType: AdminNotification['entityType'],
  labels: AdminNotificationsMenuLabels,
): string {
  return entityType === 'business'
    ? labels.adminSearchTypeBusiness
    : labels.adminSearchTypeIntroduction;
}

export function getAdminNotificationsMenuState(notifications: AdminNotification[]) {
  return {
    count: notifications.length,
    isEmpty: notifications.length === 0,
    showIndicator: notifications.length > 0,
  };
}

export function AdminNotificationsMenu({
  labels,
  notifications,
}: AdminNotificationsMenuProps) {
  const state = getAdminNotificationsMenuState(notifications);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={labels.notifications}
          className="relative size-9 text-ds-text"
          size="icon"
          variant="ghost"
        >
          <Bell className="size-4" />
          {state.showIndicator ? (
            <span className="absolute right-2 top-2 size-1.5 rounded-full bg-ds-error" />
          ) : null}
          <span className="sr-only">{labels.notifications}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span>{labels.notificationsTitle}</span>
          {state.count > 0 ? (
            <span className="rounded-full bg-ds-surface-2 px-2 py-0.5 text-ds-text-xs text-ds-text-muted">
              {state.count}
            </span>
          ) : null}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {state.isEmpty ? (
          <div className="px-2 py-3 text-ds-text-sm text-ds-text-muted">
            {labels.notificationsEmpty}
          </div>
        ) : (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <DropdownMenuItem asChild className="px-2 py-2" key={notification.id} variant="ghost">
                <Link href={notification.href}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-ds-text-xs uppercase tracking-wide text-ds-text-muted">
                          {getEntityLabel(notification.entityType, labels)}
                        </p>
                        <p className="truncate font-medium text-ds-text">{notification.title}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-ds-surface-2 px-2 py-0.5 text-ds-text-xs text-ds-text-muted">
                        {notification.status}
                      </span>
                    </div>
                    <p className="truncate text-ds-text-xs text-ds-text-muted">
                      {notification.subtitle
                        ? `${notification.subtitle} · ${labels.notificationsNeedsReview}`
                        : labels.notificationsNeedsReview}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
