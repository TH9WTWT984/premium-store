import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isPendingOrderExpired } from "@/lib/order-expiry";
import { razorpayCreateOrderSchema } from "@/lib/validation/payment";

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
    const parsed = razorpayCreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Order is required." },
        { status: 400 },
      );
    }

    const localOrderId = parsed.data.orderId;

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
      if (order.payment.status === "PAID" || order.status === "CONFIRMED") {
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

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: "Payment provider is not configured." },
        { status: 500 },
      );
    }

    // Reuse the existing Razorpay order when one has already been created.
    if (order.payment.providerPaymentId) {
      return NextResponse.json({
        ok: true,
        keyId,
        razorpayOrderId: order.payment.providerPaymentId,
        orderNumber: order.orderNumber,
        // Razorpay expects the amount in the smallest currency unit (paise).
        amount: Math.round(Number(order.total) * 100),
        currency: order.currency,
      });
    }

    const amountPaise = Math.round(Number(order.total) * 100);

    if (!Number.isSafeInteger(amountPaise) || amountPaise <= 0) {
      return NextResponse.json(
        { error: "Invalid order amount." },
        { status: 400 },
      );
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: order.currency,
          receipt: order.orderNumber,
          notes: {
            orderId: order.id,
          },
        }),
        cache: "no-store",
      },
    );

    const providerOrder = await razorpayResponse.json().catch(() => null);

    if (!razorpayResponse.ok || !providerOrder?.id) {
      return NextResponse.json(
        { error: "Unable to create the payment order." },
        { status: 502 },
      );
    }

    await prisma.payment.update({
      where: { orderId: order.id },
      data: {
        providerPaymentId: String(providerOrder.id),
        amount: order.total,
        currency: order.currency,
      },
    });

    return NextResponse.json({
      ok: true,
      keyId,
      razorpayOrderId: String(providerOrder.id),
      orderNumber: order.orderNumber,
      // Razorpay checkout receives paise, not rupees.
      amount: amountPaise,
      currency: order.currency,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to create the payment order right now." },
      { status: 500 },
    );
  }
}
