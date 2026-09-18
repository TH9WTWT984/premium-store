import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function adminWith(permission: string) {
  const admin = await getCurrentAdmin();
  return admin &&
    admin.role.permissions.some((item) => item.key === permission)
    ? admin
    : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await adminWith("products.write");
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const action = String(body.action || "");

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { error: "Action must be approve or reject." },
      { status: 400 },
    );
  }

  const review = await prisma.review.findUnique({
    where: { id },
    select: {
      id: true,
      productId: true,
      product: { select: { name: true } },
      user: { select: { email: true } },
    },
  });

  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  const isApproved = action === "approve";

  const updated = await prisma.review.update({
    where: { id },
    data: { isApproved },
    select: {
      id: true,
      isApproved: true,
      productId: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      adminUserId: admin.id,
      action: isApproved ? "APPROVE" : "REJECT",
      entity: "Review",
      entityId: updated.id,
      metadata: {
        productId: review.productId,
        productName: review.product.name,
        customerEmail: review.user.email,
      },
    },
  });

  return NextResponse.json({ ok: true, review: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await adminWith("products.write");
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const review = await prisma.review.findUnique({
    where: { id },
    select: {
      id: true,
      productId: true,
      product: { select: { name: true } },
      user: { select: { email: true } },
    },
  });

  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  await prisma.review.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      adminUserId: admin.id,
      action: "DELETE",
      entity: "Review",
      entityId: id,
      metadata: {
        productId: review.productId,
        productName: review.product.name,
        customerEmail: review.user.email,
      },
    },
  });

  return NextResponse.json({ ok: true });
}
