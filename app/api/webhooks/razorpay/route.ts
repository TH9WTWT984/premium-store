import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

function verifySignature(
  body: string,
  received: string,
  secret: string
) {
  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(received, "hex");

    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const signature =
    request.headers.get("x-razorpay-signature") || "";

  const eventId =
    request.headers.get("x-razorpay-event-id") || "";

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured." },
      { status: 500 }
    );
  }

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  try {
    const event = JSON.parse(rawBody);
    const eventName = String(event?.event || "");

    if (
      eventName !== "order.paid" &&
      eventName !== "payment.captured"
    ) {
      return NextResponse.json({
        ok: true,
        ignored: true,
      });
    }

    const razorpayOrderId = String(
      event?.payload?.order?.entity?.id ||
        event?.payload?.payment?.entity?.order_id ||
        ""
    );

    const razorpayPaymentId = String(
      event?.payload?.payment?.entity?.id || ""
    );

    if (!razorpayOrderId) {
      return NextResponse.json({
        ok: true,
        ignored: true,
      });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        provider: "RAZORPAY",
        providerPaymentId: razorpayOrderId,
      },
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({
        ok: true,
        ignored: true,
      });
    }

    if (payment.status === "PAID") {
      return NextResponse.json({
        ok: true,
        duplicate: true,
      });
    }

    const eventRecord = {
      ...event,
      webhookEventId: eventId || null,
      webhookEventName: eventName,
      razorpayPaymentId,
    };

    await prisma.$transaction(async (tx) => {
      const paymentClaim = await tx.payment.updateMany({
        where: {
          orderId: payment.orderId,
          status: "PENDING",
        },
        data: {
          status: "PAID",
          rawResponse: eventRecord,
          paidAt: new Date(),
        },
      });

      if (paymentClaim.count === 0) {
        return;
      }

      const order = await tx.order.findUnique({
        where: {
          id: payment.orderId,
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (order.status !== "PENDING") {
        throw new Error("ORDER_NOT_PAYABLE");
      }

      for (const item of order.items) {
        if (!item.variantId) continue;

        const variant = await tx.productVariant.findUnique({
          where: {
            id: item.variantId,
          },
          select: {
            id: true,
            stock: true,
            isActive: true,
          },
        });

        const stockBefore = variant?.stock ?? 0;

        const updated = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            isActive: true,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error(
            `INSUFFICIENT_STOCK:${item.name}:${stockBefore}`
          );
        }

        await tx.inventoryTransaction.create({
          data: {
            variantId: item.variantId,
            orderId: order.id,
            type: "PURCHASE_DEDUCTION",
            quantity: item.quantity,
            stockBefore,
            stockAfter: stockBefore - item.quantity,
            reason: `Purchase ${order.orderNumber}`,
          },
        });
      }

      await tx.order.updateMany({
        where: {
          id: order.id,
          status: "PENDING",
        },
        data: {
          status: "CONFIRMED",
        },
      });
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("POST /api/webhooks/razorpay", error);

    return NextResponse.json(
      {
        error: "Webhook processing failed.",
      },
      { status: 500 }
    );
  }
}
