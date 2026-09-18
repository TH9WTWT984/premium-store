import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPendingOrderExpired } from "@/lib/order-expiry";
import { razorpayVerifySchema } from "@/lib/validation/payment";

function safeEqualHex(a: string, b: string) {
  try {
    const x = Buffer.from(a, "hex");
    const y = Buffer.from(b, "hex");
    return x.length === y.length && crypto.timingSafeEqual(x, y);
  } catch {
    return false;
  }
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

    const body = await request.json().catch(() => null);
    const parsed = razorpayVerifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Incomplete payment verification response." },
        { status: 400 },
      );
    }

    const {
      order_id: localOrderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = parsed.data;

    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Payment provider is not configured." },
        { status: 500 },
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: localOrderId,
        userId: user.id,
      },
      include: {
        payment: true,
      },
    });

    if (!order || !order.payment) {
      return NextResponse.json(
        { error: "Order/payment not found." },
        { status: 404 },
      );
    }

    if (order.status !== "PENDING") {
      if (order.status === "CONFIRMED" || order.payment.status === "PAID") {
        return NextResponse.json({
          ok: true,
          orderNumber: order.orderNumber,
        });
      }

      return NextResponse.json(
        { error: "This order can no longer be paid." },
        { status: 409 },
      );
    }

    if (order.payment.status === "PAID") {
      return NextResponse.json({
        ok: true,
        orderNumber: order.orderNumber,
      });
    }

    if (isPendingOrderExpired(order.createdAt)) {
      await prisma.order.updateMany({
        where: {
          id: order.id,
          status: "PENDING",
        },
        data: {
          status: "CANCELLED",
        },
      });

      return NextResponse.json(
        { error: "This order is no longer available for payment." },
        { status: 409 },
      );
    }

    // Never trust the browser's Razorpay order ID. It must match the
    // server-stored provider order ID for this local order.
    if (order.payment.providerPaymentId !== razorpayOrderId) {
      return NextResponse.json(
        { error: "Payment order mismatch." },
        { status: 400 },
      );
    }

    const generated = crypto
      .createHmac("sha256", secret)
      .update(`${order.payment.providerPaymentId}|${razorpayPaymentId}`)
      .digest("hex");

    if (!safeEqualHex(generated, razorpaySignature)) {
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const claim = await tx.payment.updateMany({
        where: {
          orderId: order.id,
          status: "PENDING",
        },
        data: {
          status: "PAID",
          rawResponse: {
            ...body,
            verifiedFrom: "checkout",
            razorpayPaymentId,
          },
          paidAt: new Date(),
        },
      });

      if (claim.count === 0) {
        const payment = await tx.payment.findUnique({
          where: { orderId: order.id },
        });

        return {
          orderNumber: order.orderNumber,
          alreadyPaid: payment?.status === "PAID",
        };
      }

      const currentOrder = await tx.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      if (!currentOrder) {
        throw new Error("ORDER_NOT_FOUND");
      }

      for (const item of currentOrder.items) {
        if (!item.variantId) continue;

        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            isActive: true,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count !== 1) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
          });

          throw new Error(
            `INSUFFICIENT_STOCK:${item.name}:${variant?.stock ?? 0}`,
          );
        }
      }

      await tx.order.updateMany({
        where: {
          id: currentOrder.id,
          status: "PENDING",
        },
        data: {
          status: "CONFIRMED",
        },
      });

      return {
        orderNumber: currentOrder.orderNumber,
        alreadyPaid: false,
      };
    });

    return NextResponse.json({
      ok: true,
      orderNumber: result.orderNumber,
      alreadyPaid: result.alreadyPaid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message.startsWith("INSUFFICIENT_STOCK:")) {
      const [, name, stock] = message.split(":");

      return NextResponse.json(
        { error: `${name} only has ${stock} available.` },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Unable to verify the payment right now." },
      { status: 500 },
    );
  }
}
