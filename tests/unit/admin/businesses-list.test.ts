import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/db/client', () => ({
  db: {
    query: {
      businesses: {
        findMany: vi.fn(),
      },
    },
  },
}));

describe('businessesToCsv', () => {
  it('neutralizes spreadsheet formulas before exporting CSV', async () => {
    const { businessesToCsv } = await import('../../../src/features/admin/lib/businesses-list');

    const csv = businessesToCsv([
      {
        categoryName: '=cmd',
        createdAt: new Date('2026-06-01T00:00:00.000Z'),
        description: '@payload',
        email: '+evil@example.com',
        id: 'business-1',
        isRecommended: false,
        isTopPartner: false,
        name: '=SUM(1,1)',
        ownerName: '-owner',
        phone: '\t123',
        slug: 'formula-test',
        status: 'PUBLISHED',
        website: 'https://example.com',
      },
    ]);

    expect(csv).toContain("\"'=SUM(1,1)\"");
    expect(csv).toContain("'-owner");
    expect(csv).toContain("'+evil@example.com");
    expect(csv).toContain("'\t123");
    expect(csv).toContain("'@payload");
  });
});
