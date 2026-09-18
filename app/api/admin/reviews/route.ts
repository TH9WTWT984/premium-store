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

export async function GET(request: NextRequest) {
  const admin = await adminWith("products.read");
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const status = new URL(request.url).searchParams.get("status") || "all";

  const where =
    status === "pending"
      ? { isApproved: false }
      : status === "approved"
        ? { isApproved: true }
        : {};

  const [reviews, counts] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        body: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
    Promise.all([
      prisma.review.count({ where: { isApproved: false } }),
      prisma.review.count({ where: { isApproved: true } }),
      prisma.review.count(),
    ]),
  ]);

  return NextResponse.json({
    reviews,
    counts: {
      pending: counts[0],
      approved: counts[1],
      total: counts[2],
    },
  });
}
