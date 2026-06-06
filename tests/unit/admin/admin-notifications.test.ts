import assert from 'node:assert/strict';
import { test } from 'vitest';

import { dropdownMenuItemVariants } from '../../../src/components/ui/dropdown-menu';
import { getAdminNotificationsMenuState } from '../../../src/features/admin/components/admin-notifications-menu';
import { buildAdminNotifications } from '../../../src/features/admin/lib/admin-notifications.shared';

test('buildAdminNotifications returns only mapped items sorted newest first with localized hrefs', () => {
  const notifications = buildAdminNotifications('en', {
    businesses: [
      {
        createdAt: new Date('2026-06-01T09:00:00.000Z'),
        id: 'business-1',
        name: 'Pending Business',
        ownerName: 'Owner One',
        status: 'PENDING',
      },
    ],
    introductions: [
      {
        clientName: 'Alice Client',
        createdAt: new Date('2026-06-02T10:00:00.000Z'),
        id: 'introduction-1',
        requesterName: 'Requester One',
        status: 'SUBMITTED',
        targetBusinessName: 'Target Co',
      },
      {
        clientName: 'Bob Client',
        createdAt: new Date('2026-06-01T12:00:00.000Z'),
        id: 'introduction-2',
        requesterName: 'Requester Two',
        status: 'UNDER_REVIEW',
        targetBusinessName: null,
      },
    ],
  });

  assert.deepEqual(
    notifications.map((notification) => ({
      entityType: notification.entityType,
      href: notification.href,
      id: notification.id,
      status: notification.status,
      subtitle: notification.subtitle,
      title: notification.title,
    })),
    [
      {
        entityType: 'introduction',
        href: '/en/admin/introductions/introduction-1',
        id: 'introduction:introduction-1',
        status: 'SUBMITTED',
        subtitle: 'Target Co',
        title: 'Alice Client',
      },
      {
        entityType: 'introduction',
        href: '/en/admin/introductions/introduction-2',
        id: 'introduction:introduction-2',
        status: 'UNDER_REVIEW',
        subtitle: 'Requester Two',
        title: 'Bob Client',
      },
      {
        entityType: 'business',
        href: '/en/admin/businesses/business-1',
        id: 'business:business-1',
        status: 'PENDING',
        subtitle: 'Owner One',
        title: 'Pending Business',
      },
    ],
  );
});

test('admin notifications menu state exposes badge and empty-state flags', () => {
  assert.deepEqual(getAdminNotificationsMenuState([]), {
    count: 0,
    isEmpty: true,
    showIndicator: false,
  });

  assert.deepEqual(
    getAdminNotificationsMenuState([
      {
        entityId: 'business-1',
        entityType: 'business',
        href: '/en/admin/businesses/business-1',
        id: 'business:business-1',
        status: 'PENDING',
        subtitle: null,
        timestamp: '2026-06-01T09:00:00.000Z',
        title: 'Pending Business',
      },
    ]),
    {
      count: 1,
      isEmpty: false,
      showIndicator: true,
    },
  );
});

test('dropdownMenuItemVariants supports ghost without changing destructive variant styling', () => {
  const ghostClassName = dropdownMenuItemVariants({ variant: 'ghost' });
  const destructiveClassName = dropdownMenuItemVariants({ variant: 'destructive' });

  assert.match(ghostClassName, /hover:bg-ds-surface-2/);
  assert.match(ghostClassName, /cursor-pointer/);
  assert.match(destructiveClassName, /text-ds-error/);
  assert.match(destructiveClassName, /focus:bg-ds-error\/10/);
});
