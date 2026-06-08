import { describe, expect, it } from 'vitest';

import {
  type AdminBusinessListItem,
} from '../../../src/features/admin/lib/businesses-list';
import { filterAdminBusinesses } from '../../../src/features/admin/lib/businesses-filters';

const businesses: AdminBusinessListItem[] = [
  {
    categoryName: 'Consulting',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    description: 'Premium growth advisory',
    email: 'ada@example.com',
    id: 'biz-1',
    isRecommended: true,
    isTopPartner: false,
    name: 'Ada Advisory',
    ownerName: 'Ada',
    phone: '+15550001',
    slug: 'ada-advisory',
    status: 'PUBLISHED',
    website: 'https://ada.example.com',
  },
  {
    categoryName: 'Events',
    createdAt: new Date('2026-02-01T00:00:00.000Z'),
    description: 'Members-only events',
    email: 'club@example.com',
    id: 'biz-2',
    isRecommended: false,
    isTopPartner: true,
    name: 'Club Events',
    ownerName: 'Grace',
    phone: '+15550002',
    slug: 'club-events',
    status: 'UNDER_REVIEW',
    website: 'https://events.example.com',
  },
];

describe('filterAdminBusinesses', () => {
  it('filters by status when provided', () => {
    expect(filterAdminBusinesses(businesses, { status: 'PUBLISHED' })).toEqual([businesses[0]]);
  });

  it('matches trimmed search by name and slug case-insensitively', () => {
    expect(filterAdminBusinesses(businesses, { q: '  CLUB  ' })).toEqual([businesses[1]]);
    expect(filterAdminBusinesses(businesses, { q: 'advisory' })).toEqual([businesses[0]]);
  });

  it('combines status and search filters', () => {
    expect(filterAdminBusinesses(businesses, { q: 'club', status: 'UNDER_REVIEW' })).toEqual([
      businesses[1],
    ]);
    expect(filterAdminBusinesses(businesses, { q: 'club', status: 'PUBLISHED' })).toEqual([]);
  });
});
