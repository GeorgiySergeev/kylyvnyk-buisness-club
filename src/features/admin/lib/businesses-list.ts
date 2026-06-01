import 'server-only';

import { desc } from 'drizzle-orm';

import { db } from '@/db/client';
import { businesses } from '@/db/schema';

export type AdminBusinessListItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  isTopPartner: boolean;
  isRecommended: boolean;
  createdAt: Date;
  ownerName: string | null;
  categoryName: string | null;
};

export async function fetchAdminBusinesses(): Promise<AdminBusinessListItem[]> {
  const rows = await db.query.businesses.findMany({
    columns: {
      createdAt: true,
      description: true,
      email: true,
      id: true,
      isRecommended: true,
      isTopPartner: true,
      name: true,
      phone: true,
      slug: true,
      status: true,
      website: true,
    },
    orderBy: [desc(businesses.createdAt)],
    with: {
      category: {
        columns: {
          name: true,
        },
      },
      user: {
        columns: {
          displayName: true,
        },
      },
    },
  });

  return rows.map((row) => {
    const { user, category, ...rest } = row;
    return {
      ...rest,
      categoryName: category?.name ?? null,
      ownerName: user?.displayName ?? null,
    };
  });
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function businessesToCsv(rows: AdminBusinessListItem[]): string {
  const header = ['ID', 'Name', 'Slug', 'Status', 'Owner', 'Category', 'Phone', 'Email', 'Website', 'Description', 'Top Partner', 'Recommended', 'Created'];
  const lines = [
    header.join(','),
    ...rows.map((b) =>
      [
        b.id,
        b.name,
        b.slug,
        b.status,
        b.ownerName ?? '',
        b.categoryName ?? '',
        b.phone ?? '',
        b.email ?? '',
        b.website ?? '',
        b.description ?? '',
        b.isTopPartner ? 'Yes' : 'No',
        b.isRecommended ? 'Yes' : 'No',
        b.createdAt.toISOString(),
      ]
        .map((value) => escapeCsvField(value))
        .join(','),
    ),
  ];

  return `${lines.join('\r\n')}\r\n`;
}
