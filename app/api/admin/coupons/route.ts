import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

async function adminWith(permission: string) {
  const admin = await getCurrentAdmin();
  return admin && admin.role.permissions.some((item) => item.key === permission) ? admin : null;
}

function decimalValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET() {
  const admin = await adminWith("products.read");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { usages: true } } },
  });

  return NextResponse.json(coupons);
}

export async function POST(request: Request) {
  const admin = await adminWith("products.write");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase();
    const type = String(body.type || "");
    const value = decimalValue(body.value);
    const minOrderAmount = decimalValue(body.minOrderAmount);
    const maxDiscount = decimalValue(body.maxDiscount);
    const usageLimit =
      body.usageLimit === "" || body.usageLimit === null || body.usageLimit === undefined
        ? null
        : Number(body.usageLimit);

    if (!code || !/^[A-Z0-9_-]{3,40}$/.test(code)) {
      return NextResponse.json(
        { error: "Coupon code must be 3–40 characters using letters, numbers, _ or -." },
        { status: 400 },
      );
    }
    if (type !== "PERCENTAGE" && type !== "FIXED") {
      return NextResponse.json({ error: "Invalid coupon type." }, { status: 400 });
    }
    if (value === null || value <= 0) {
      return NextResponse.json({ error: "Discount value must be greater than 0." }, { status: 400 });
    }
    if (type === "PERCENTAGE" && value > 100) {
      return NextResponse.json({ error: "Percentage discount cannot exceed 100." }, { status: 400 });
    }
    if (minOrderAmount !== null && minOrderAmount < 0) {
      return NextResponse.json({ error: "Minimum order amount cannot be negative." }, { status: 400 });
    }
    if (maxDiscount !== null && maxDiscount <= 0) {
      return NextResponse.json({ error: "Maximum discount must be greater than 0." }, { status: 400 });
    }
    if (usageLimit !== null && (!Number.isInteger(usageLimit) || usageLimit <= 0)) {
      return NextResponse.json({ error: "Usage limit must be a positive whole number." }, { status: 400 });
    }

    const startsAt = parseDate(body.startsAt);
    const expiresAt = parseDate(body.expiresAt);
    if (body.startsAt && !startsAt) return NextResponse.json({ error: "Invalid start date." }, { status: 400 });
    if (body.expiresAt && !expiresAt) return NextResponse.json({ error: "Invalid expiry date." }, { status: 400 });
    if (startsAt && expiresAt && startsAt >= expiresAt) {
      return NextResponse.json({ error: "Expiry must be after the start date." }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type: type as "PERCENTAGE" | "FIXED",
        value,
        minOrderAmount,
        maxDiscount,
        usageLimit,
        startsAt,
        expiresAt,
        isActive: body.isActive !== false,
      },
    });

    await prisma.activityLog.create({
      data: {
        adminUserId: admin.id,
        action: "CREATE",
        entity: "Coupon",
        entityId: coupon.id,
        metadata: { code: coupon.code, type: coupon.type, value: coupon.value.toString() },
      },
    });

    return NextResponse.json({ id: coupon.id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.code === "P2002" ? "A coupon with that code already exists." : "Unable to create coupon." },
      { status: 400 },
    );
  }
}
