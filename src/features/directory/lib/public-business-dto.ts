export const PUBLIC_BUSINESS_DTO_KEYS = [
  'category',
  'city',
  'country',
  'discountLabel',
  'description',
  'id',
  'isRecommended',
  'isTopPartner',
  'logoUrl',
  'name',
  'slug',
  'website',
] as const;

type PublicBusinessRow = {
  category: { name: string; slug: string } | null;
  city?: { name: string } | null;
  country: { flagEmoji: string | null; iso2: string; name: string } | null;
  description: string | null;
  discountLabel: string | null;
  id: string;
  isRecommended: boolean;
  isTopPartner: boolean;
  logoUrl: string | null;
  name: string;
  slug: string;
  website: string | null;
};

export type PublicBusinessDto = {
  category: { name: string; slug: string } | null;
  city: { name: string } | null;
  country: { flagEmoji: string | null; iso2: string; name: string } | null;
  description: string | null;
  discountLabel: string | null;
  id: string;
  isRecommended: boolean;
  isTopPartner: boolean;
  logoUrl: string | null;
  name: string;
  slug: string;
  website: string | null;
};

export function createPublicBusinessDto(row: PublicBusinessRow): PublicBusinessDto {
  return {
    category: row.category
      ? {
          name: row.category.name,
          slug: row.category.slug,
        }
      : null,
    city: row.city
      ? {
          name: row.city.name,
        }
      : null,
    country: row.country
      ? {
          flagEmoji: row.country.flagEmoji,
          iso2: row.country.iso2,
          name: row.country.name,
        }
      : null,
    description: row.description,
    discountLabel: row.discountLabel,
    id: row.id,
    isRecommended: row.isRecommended,
    isTopPartner: row.isTopPartner,
    logoUrl: row.logoUrl,
    name: row.name,
    slug: row.slug,
    website: row.website,
  };
}
