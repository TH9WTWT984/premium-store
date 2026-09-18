import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPendingOrderExpiresAt, isPendingOrderExpired } from "@/lib/order-expiry";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ order: null });

    const order = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: "PENDING",
        payment: { is: { status: "PENDING" } },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        createdAt: true,
        currency: true,
      },
    });

    if (!order) return NextResponse.json({ order: null });

    if (isPendingOrderExpired(order.createdAt)) {
      await prisma.order.updateMany({
        where: { id: order.id, userId: user.id, status: "PENDING" },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({ order: null });
    }

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        currency: order.currency,
        expiresAt: getPendingOrderExpiresAt(order.createdAt).toISOString(),
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/orders/pending", error);
    return NextResponse.json({ order: null }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
