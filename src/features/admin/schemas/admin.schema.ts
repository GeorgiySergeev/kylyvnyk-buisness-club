import { z } from 'zod';

export const userRoleEnumSchema = z.enum(['FREE', 'BUSINESS', 'ADMIN', 'VIP']);
export const userStatusEnumSchema = z.enum(['ACTIVE', 'INACTIVE', 'BANNED']);

export const updateUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: userRoleEnumSchema,
});

export const updateUserStatusSchema = z.object({
  userId: z.string().uuid(),
  status: userStatusEnumSchema,
});

export const businessStatusEnumSchema = z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'HIDDEN']);

export const updateBusinessStatusSchema = z.object({
  businessId: z.string().uuid(),
  status: businessStatusEnumSchema,
});

export const toggleBusinessFeatureSchema = z.object({
  businessId: z.string().uuid(),
  isRecommended: z.boolean().optional(),
  isTopPartner: z.boolean().optional(),
});

export const softDeleteBusinessSchema = z.object({
  businessId: z.string().uuid(),
});

export const restoreBusinessSchema = z.object({
  businessId: z.string().uuid(),
});

export const updateCardSchema = z.object({
  cardId: z.string().uuid(),
  expiresAt: z.coerce.date().nullable().optional(),
  memberType: z.enum(['FREE', 'BUSINESS', 'VIP']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'EXPIRED']),
});

export const createCardSchema = z.object({
  expiresAt: z.coerce.date().nullable().optional(),
  memberType: z.enum(['FREE', 'BUSINESS', 'VIP']),
  number: z.string().trim().min(4).max(64),
  userId: z.string().uuid(),
});

export const updateProfileSchema = z.object({
  avatarUrl: z.string().url().nullable().optional(),
  bio: z.string().trim().max(2000).nullable().optional(),
  cityId: z.number().int().positive().nullable().optional(),
  countryId: z.number().int().positive().nullable().optional(),
  profileId: z.string().uuid(),
});

export const referenceNameSchema = z.string().trim().min(2).max(120);

export const createCountrySchema = z.object({
  flagEmoji: z.string().trim().max(16).nullable().optional(),
  iso2: z
    .string()
    .trim()
    .length(2)
    .transform((v) => v.toUpperCase()),
  name: referenceNameSchema,
});

export const updateCountrySchema = createCountrySchema.extend({
  countryId: z.number().int().positive(),
});

export const deleteCountrySchema = z.object({
  countryId: z.number().int().positive(),
});

export const createCitySchema = z.object({
  countryId: z.number().int().positive(),
  name: referenceNameSchema,
});

export const updateCitySchema = createCitySchema.extend({
  cityId: z.number().int().positive(),
});

export const deleteCitySchema = z.object({
  cityId: z.number().int().positive(),
});

export const createCategorySchema = z.object({
  icon: z.string().trim().max(64).nullable().optional(),
  name: referenceNameSchema,
  parentId: z.number().int().positive().nullable().optional(),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
});

export const updateCategorySchema = createCategorySchema.extend({
  categoryId: z.number().int().positive(),
});

export const deleteCategorySchema = z.object({
  categoryId: z.number().int().positive(),
});
