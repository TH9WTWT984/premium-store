import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { couponCodeSchema } from "@/lib/validation/api";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = couponCodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Enter a coupon code." },
        { status: 400 },
      );
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: parsed.data.code },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { error: "Coupon is not available." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      ok: true,
      code: coupon.code,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to validate coupon." },
      { status: 500 },
    );
  }
}
