import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateCheckoutTotals,
  resolveCoupon,
  validateCheckoutCart,
} from "@/lib/checkout";

function clean(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const rawAddress = body.shippingAddress ?? {};
    const couponCode = clean(body.couponCode).toUpperCase();

    const shippingAddress = {
      firstName: clean(rawAddress.firstName),
      lastName: clean(rawAddress.lastName),
      phone: clean(rawAddress.phone),
      line1: clean(rawAddress.line1),
      line2: clean(rawAddress.line2) || null,
      city: clean(rawAddress.city),
      state: clean(rawAddress.state),
      postalCode: clean(rawAddress.postalCode),
      country: clean(rawAddress.country) || "IN",
    };

    const required = [
      ["firstName", shippingAddress.firstName],
      ["lastName", shippingAddress.lastName],
      ["phone", shippingAddress.phone],
      ["line1", shippingAddress.line1],
      ["city", shippingAddress.city],
      ["state", shippingAddress.state],
      ["postalCode", shippingAddress.postalCode],
      ["country", shippingAddress.country],
    ] as const;

    const missing = required.find(([, value]) => !value);

    if (missing) {
      return NextResponse.json(
        { error: `${missing[0]} is required.` },
        { status: 400 },
      );
    }

    if (!/^\d{5,10}$/.test(shippingAddress.postalCode)) {
      return NextResponse.json(
        { error: "Enter a valid postal code." },
        { status: 400 },
      );
    }

    const checkout = await validateCheckoutCart(user.id, couponCode);

    const order = await prisma.$transaction(
      async (tx) => {
        for (const item of checkout.items) {
          if (!item.variantId) continue;

          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });

          if (
            !variant ||
            !variant.isActive ||
            variant.stock < item.quantity
          ) {
            throw new Error(
              `INSUFFICIENT_STOCK:${item.productName}:${variant?.stock ?? 0}`,
            );
          }
        }

        const baseTotals = calculateCheckoutTotals(checkout.items);

        const coupon = couponCode
          ? await resolveCoupon(
              tx,
              user.id,
              couponCode,
              baseTotals.subtotal,
            )
          : null;

        const totals = calculateCheckoutTotals(
          checkout.items,
          coupon?.discount ?? 0,
        );

        const address = await tx.address.create({
          data: {
            userId: user.id,
            label: "Checkout",
            firstName: shippingAddress.firstName,
            lastName: shippingAddress.lastName || null,
            phone: shippingAddress.phone,
            line1: shippingAddress.line1,
            line2: shippingAddress.line2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country,
            isDefault: false,
          },
        });

        const now = new Date();
        const orderNumber =
          `AT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}` +
          `-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            user: { connect: { id: user.id } },
            address: { connect: { id: address.id } },
            status: "PENDING",
            subtotal: totals.subtotal,
            discount: totals.discount,
            shipping: totals.shipping,
            tax: totals.tax,
            total: totals.total,
            currency: "INR",

            // Create the local payment record together with the order.
            // Razorpay's create-order endpoint expects this relation to exist.
            payment: {
              create: {
                provider: "RAZORPAY",
                status: "PENDING",
                amount: totals.total,
                currency: "INR",
              },
            },

            items: {
              create: checkout.items.map((item) => ({
                product: {
                  connect: { id: item.productId },
                },
                ...(item.variantId
                  ? {
                      variant: {
                        connect: { id: item.variantId },
                      },
                    }
                  : {}),
                name: item.productName,
                sku: item.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: Number(item.unitPrice) * item.quantity,
              })),
            },
          },
        });

        if (coupon) {
          await tx.couponUsage.create({
            data: {
              couponId: coupon.id,
              userId: user.id,
              orderId: createdOrder.id,
            },
          });

          const updatedCoupon = await tx.coupon.updateMany({
            where: {
              id: coupon.id,
              isActive: true,
              OR: [
                { usageLimit: null },
                {
                  usedCount: {
                    lt: coupon.usageLimit ?? 0,
                  },
                },
              ],
            },
            data: {
              usedCount: { increment: 1 },
            },
          });

          if (updatedCoupon.count !== 1) {
            throw new Error("COUPON_LIMIT_REACHED");
          }
        }

        await tx.cartItem.deleteMany({
          where: { cartId: checkout.cart.id },
        });

        return {
          id: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          total: totals.total,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    return NextResponse.json({
      ok: true,
      id: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
    });
  } catch (error) {
    console.error("POST /api/checkout", error);

    const message = error instanceof Error ? error.message : "";

    if (message === "EMPTY_CART") {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 },
      );
    }

    if (message.startsWith("INSUFFICIENT_STOCK:")) {
      const [, name, stock] = message.split(":");
      return NextResponse.json(
        { error: `${name} only has ${stock} available.` },
        { status: 409 },
      );
    }

    if (message.startsWith("UNAVAILABLE:")) {
      return NextResponse.json(
        { error: `${message.split(":")[1]} is no longer available.` },
        { status: 409 },
      );
    }

    if (message.startsWith("VARIANT_UNAVAILABLE:")) {
      return NextResponse.json(
        {
          error: `The selected option for ${message.split(":")[1]} is no longer available.`,
        },
        { status: 409 },
      );
    }

    if (message.startsWith("VARIANT_REQUIRED:")) {
      return NextResponse.json(
        {
          error: `Please select an option for ${message.split(":")[1]}.`,
        },
        { status: 400 },
      );
    }

    if (message.startsWith("COUPON_INVALID:")) {
      return NextResponse.json(
        { error: message.slice("COUPON_INVALID:".length) },
        { status: 400 },
      );
    }

    if (message === "COUPON_LIMIT_REACHED") {
      return NextResponse.json(
        {
          error:
            "This coupon has just reached its usage limit. Please try again without it.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Unable to create the order right now." },
      { status: 500 },
    );
  }
}
