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
