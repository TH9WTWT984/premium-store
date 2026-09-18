import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderStatusSchema } from "@/lib/validation/api";

const allowedTransitions: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();

  if (
    !admin ||
    !admin.role.permissions.some(
      (permission) => permission.key === "orders.write",
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = orderStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid order status." },
      { status: 400 },
    );
  }

  const nextStatus = parsed.data.status;

  const order = await prisma.order.findUnique({
    where: { id },
    select: { status: true },
  });

  if (!order) {
    return NextResponse.json(
      { error: "Order not found." },
      { status: 404 },
    );
  }

  if (order.status === nextStatus) {
    return NextResponse.json({ ok: true, status: nextStatus });
  }

  if (!allowedTransitions[order.status]?.includes(nextStatus)) {
    return NextResponse.json(
      {
        error: `Cannot move an order from ${order.status} to ${nextStatus}.`,
      },
      { status: 409 },
    );
  }

  const updated = await prisma.order.update({
    where: { id },
    data: { status: nextStatus as any },
    select: { id: true, status: true, orderNumber: true },
  });

  return NextResponse.json({
    ok: true,
    status: updated.status,
  });
}
