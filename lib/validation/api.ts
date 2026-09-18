import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(256),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().max(60).optional().default(""),
  email: emailSchema,
  password: z.string().min(8).max(128),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().max(160).optional().default(""),
  description: z.string().max(2000).optional().default(""),
  imageUrl: z.string().trim().max(2000).optional().default(""),
  sortOrder: z.coerce.number().int().min(0).max(100000).default(0),
  isActive: z.boolean().default(true),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
});

export const cartAddSchema = z.object({
  productId: z.string().trim().min(1).max(128),
  variantId: z.string().trim().min(1).max(128).nullable().optional(),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const cartUpdateSchema = z.object({
  itemId: z.string().trim().min(1).max(128),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const couponCodeSchema = z.object({
  code: z.string().trim().min(1).max(64).transform((value) => value.toUpperCase()),
});

export const wishlistSchema = z.object({
  productId: z.string().trim().min(1).max(128),
});

export function parseJson<T extends z.ZodTypeAny>(schema: T, value: unknown) {
  const result = schema.safeParse(value);
  return result.success
    ? { success: true as const, data: result.data }
    : {
        success: false as const,
        error: result.error.issues[0]?.message || "Invalid request.",
      };
}
