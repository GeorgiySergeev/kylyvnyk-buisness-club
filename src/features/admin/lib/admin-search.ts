import 'server-only';

import { and, asc, desc, ilike, inArray, isNull, or } from 'drizzle-orm';

import type { SupportedLocale } from '@/components/layout/navigation';
import { localizeHref } from '@/components/layout/navigation';
import { db } from '@/db/client';
import { businesses, categories, clubCards, introductions, users } from '@/db/schema';

import { normalizeAdminSearchQuery } from '../schemas/admin-search.schema';

export type AdminSearchResultType = 'business' | 'card' | 'category' | 'introduction' | 'user';

export type AdminSearchResult = {
  href: string;
  id: string;
  status?: string;
  subtitle?: string;
  title: string;
  type: AdminSearchResultType;
};

const PER_ENTITY_LIMIT = 5;
const TOTAL_LIMIT = 15;

export async function searchAdminRecords(
  query: string,
  locale: SupportedLocale,
): Promise<AdminSearchResult[]> {
  const normalizedQuery = normalizeAdminSearchQuery(query);
  if (!normalizedQuery) return [];

  const pattern = `%${normalizedQuery}%`;
  const [relatedUserRows, relatedBusinessRows] = await Promise.all([
    db.query.users.findMany({
      columns: {
        id: true,
      },
      limit: 25,
      where: and(
        isNull(users.deletedAt),
        or(ilike(users.displayName, pattern), ilike(users.phone, pattern), ilike(users.email, pattern)),
      ),
    }),
    db.query.businesses.findMany({
      columns: {
        id: true,
      },
      limit: 25,
      where: and(
        isNull(businesses.deletedAt),
        or(ilike(businesses.name, pattern), ilike(businesses.slug, pattern)),
      ),
    }),
  ]);
  const relatedUserIds = relatedUserRows.map((user) => user.id);
  const relatedBusinessIds = relatedBusinessRows.map((business) => business.id);
  const cardWhere =
    relatedUserIds.length > 0
      ? or(ilike(clubCards.number, pattern), inArray(clubCards.userId, relatedUserIds))
      : ilike(clubCards.number, pattern);
  const introductionWhere =
    relatedUserIds.length > 0 && relatedBusinessIds.length > 0
      ? or(
          ilike(introductions.clientName, pattern),
          inArray(introductions.requesterId, relatedUserIds),
          inArray(introductions.targetBusinessId, relatedBusinessIds),
        )
      : relatedUserIds.length > 0
        ? or(ilike(introductions.clientName, pattern), inArray(introductions.requesterId, relatedUserIds))
        : relatedBusinessIds.length > 0
          ? or(
              ilike(introductions.clientName, pattern),
              inArray(introductions.targetBusinessId, relatedBusinessIds),
            )
          : ilike(introductions.clientName, pattern);

  const [userRows, businessRows, cardRows, introductionRows, categoryRows] = await Promise.all([
    db.query.users.findMany({
      columns: {
        displayName: true,
        email: true,
        id: true,
        phone: true,
        status: true,
      },
      limit: PER_ENTITY_LIMIT,
      orderBy: [desc(users.createdAt)],
      where: and(
        isNull(users.deletedAt),
        or(ilike(users.displayName, pattern), ilike(users.phone, pattern), ilike(users.email, pattern)),
      ),
    }),
    db.query.businesses.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
        status: true,
      },
      limit: PER_ENTITY_LIMIT,
      orderBy: [desc(businesses.createdAt)],
      where: and(
        isNull(businesses.deletedAt),
        or(ilike(businesses.name, pattern), ilike(businesses.slug, pattern)),
      ),
      with: {
        user: {
          columns: {
            displayName: true,
          },
        },
      },
    }),
    db.query.clubCards.findMany({
      columns: {
        id: true,
        number: true,
        status: true,
      },
      limit: PER_ENTITY_LIMIT,
      orderBy: [desc(clubCards.createdAt)],
      where: cardWhere,
      with: {
        user: {
          columns: {
            displayName: true,
            phone: true,
          },
        },
      },
    }),
    db.query.introductions.findMany({
      columns: {
        clientName: true,
        id: true,
        status: true,
      },
      limit: PER_ENTITY_LIMIT,
      orderBy: [desc(introductions.createdAt)],
      where: introductionWhere,
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
    db.query.categories.findMany({
      columns: {
        id: true,
        name: true,
        slug: true,
      },
      limit: PER_ENTITY_LIMIT,
      orderBy: [asc(categories.name)],
      where: or(ilike(categories.name, pattern), ilike(categories.slug, pattern)),
    }),
  ]);

  const userResults: AdminSearchResult[] = userRows.map((user) => ({
      href: localizeHref(locale, `/admin/users/${user.id}`),
      id: user.id,
      status: user.status,
      subtitle: user.phone,
      title: user.displayName ?? user.email ?? user.phone,
      type: 'user',
    }));

  const businessResults: AdminSearchResult[] = businessRows.map((business) => ({
    href: localizeHref(locale, `/admin/businesses/${business.id}`),
    id: business.id,
    status: business.status,
    subtitle: business.user?.displayName ?? business.slug,
    title: business.name,
    type: 'business',
  }));

  const cardResults: AdminSearchResult[] = cardRows.map((card) => ({
      href: localizeHref(locale, `/admin/cards/${card.id}`),
      id: card.id,
      status: card.status,
      subtitle: card.user?.displayName ?? card.user?.phone,
      title: card.number,
      type: 'card',
    }));

  const introductionResults: AdminSearchResult[] = introductionRows.map((introduction) => ({
      href: localizeHref(locale, `/admin/introductions/${introduction.id}`),
      id: introduction.id,
      status: introduction.status,
      subtitle: introduction.targetBusiness?.name ?? introduction.requester?.displayName ?? undefined,
      title: introduction.clientName,
      type: 'introduction',
    }));

  const categoryResults: AdminSearchResult[] = categoryRows.map((category) => ({
    href: `${localizeHref(locale, '/admin/categories')}?q=${encodeURIComponent(category.slug)}`,
    id: String(category.id),
    subtitle: category.slug,
    title: category.name,
    type: 'category',
  }));

  return [
    ...userResults,
    ...businessResults,
    ...cardResults,
    ...introductionResults,
    ...categoryResults,
  ].slice(0, TOTAL_LIMIT);
}
