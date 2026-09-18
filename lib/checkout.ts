import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DbClient = typeof prisma | Prisma.TransactionClient;

export async function loadCheckoutCart(userId: string) {
  return prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
              images: {
                orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
                take: 1,
              },
              variants: {
                where: { isActive: true },
              },
            },
          },
          variant: true,
        },
      },
    },
  });
}

function throwCouponError(message: string): never {
  throw new Error(`COUPON_INVALID:${message}`);
}

export async function resolveCoupon(
  db: DbClient,
  userId: string,
  code: string,
  subtotal: number,
) {
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) return null;

  const coupon = await db.coupon.findUnique({
    where: { code: normalizedCode },
  });

  if (!coupon || !coupon.isActive) {
    throwCouponError("Coupon is not available.");
  }

  const now = new Date();

  if (coupon.startsAt && now < coupon.startsAt) {
    throwCouponError("This coupon is not active yet.");
  }

  if (coupon.expiresAt && now >= coupon.expiresAt) {
    throwCouponError("This coupon has expired.");
  }

  if (
    coupon.minOrderAmount !== null &&
    subtotal < Number(coupon.minOrderAmount)
  ) {
    throwCouponError(
      `Minimum order value is ₹${Number(
        coupon.minOrderAmount,
      ).toLocaleString("en-IN")}.`,
    );
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    throwCouponError("This coupon has reached its usage limit.");
  }

  const alreadyUsed = await db.couponUsage.findUnique({
    where: {
      couponId_userId: {
        couponId: coupon.id,
        userId,
      },
    },
    select: { id: true },
  });

  if (alreadyUsed) {
    throwCouponError("You have already used this coupon.");
  }

  const rawDiscount =
    coupon.type === "PERCENTAGE"
      ? subtotal * (Number(coupon.value) / 100)
      : Number(coupon.value);

  const cappedDiscount =
    coupon.maxDiscount !== null
      ? Math.min(rawDiscount, Number(coupon.maxDiscount))
      : rawDiscount;

  const discount = Math.max(
    0,
    Math.min(subtotal, cappedDiscount),
  );

  return {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    discount,
    usageLimit: coupon.usageLimit,
  };
}

export function calculateCheckoutTotals(
  items: Array<{ unitPrice: unknown; quantity: number }>,
  discount = 0,
) {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.unitPrice) * item.quantity,
    0,
  );

  const shipping = 0;
  const tax = 0;
  const safeDiscount = Math.max(
    0,
    Math.min(subtotal, Number(discount) || 0),
  );

  return {
    subtotal,
    discount: safeDiscount,
    shipping,
    tax,
    total: subtotal - safeDiscount + shipping + tax,
  };
}

export async function validateCheckoutCart(
  userId: string,
  couponCode = "",
) {
  const cart = await loadCheckoutCart(userId);

  if (!cart || cart.items.length === 0) {
    throw new Error("EMPTY_CART");
  }

  const items = [];

  for (const item of cart.items) {
    if (item.product.status !== "ACTIVE") {
      throw new Error(`UNAVAILABLE:${item.product.name}`);
    }

    if (item.variantId) {
      const variant = item.product.variants.find(
        (candidate) => candidate.id === item.variantId,
      );

      if (!variant || !variant.isActive) {
        throw new Error(`VARIANT_UNAVAILABLE:${item.product.name}`);
      }

      if (item.quantity > variant.stock) {
        throw new Error(
          `INSUFFICIENT_STOCK:${item.product.name}:${variant.stock}`,
        );
      }
    } else if (item.product.variants.length > 0) {
      throw new Error(`VARIANT_REQUIRED:${item.product.name}`);
    }

    const unitPrice =
      item.variant?.price ?? item.product.price;

    items.push({
      cartItemId: item.id,
      productId: item.productId,
      variantId: item.variantId,
      productName: item.product.name,
      sku: item.variant?.sku ?? item.product.sku,
      unitPrice,
      quantity: item.quantity,
    });
  }

  const baseTotals = calculateCheckoutTotals(items);

  const coupon = couponCode
    ? await resolveCoupon(
        prisma,
        userId,
        couponCode,
        baseTotals.subtotal,
      )
    : null;

  return {
    cart,
    items,
    coupon,
    totals: calculateCheckoutTotals(
      items,
      coupon?.discount ?? 0,
    ),
  };
}
