import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseProductId(params: { productId: string }) {
  const productId = String(params.productId || "").trim();
  return productId || null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId: rawProductId } = await params;
  const productId = parseProductId({ productId: rawProductId });

  if (!productId) {
    return NextResponse.json({ error: "Product is required." }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      user: { select: { firstName: true, lastName: true } },
    },
  });

  return NextResponse.json({
    reviews: reviews.map((review) => ({
      ...review,
      author:
        `${review.user.firstName} ${review.user.lastName || ""}`.trim() || "Customer",
    })),
    summary: { count: reviews.length },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to write a review." },
      { status: 401 },
    );
  }

  const { productId: rawProductId } = await params;
  const productId = parseProductId({ productId: rawProductId });

  if (!productId) {
    return NextResponse.json({ error: "Product is required." }, { status: 400 });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, status: true },
    });

    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already reviewed this product." },
        { status: 409 },
      );
    }

    const body = await request.json();
    const title = body.title == null ? null : String(body.title).trim();
    const reviewBody = String(body.body ?? "").trim();

    if (!reviewBody || reviewBody.length < 10) {
      return NextResponse.json(
        { error: "Review must be at least 10 characters." },
        { status: 400 },
      );
    }

    if (reviewBody.length > 2000 || (title && title.length > 120)) {
      return NextResponse.json(
        { error: "Review is too long." },
        { status: 400 },
      );
    }

    const verifiedPurchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: user.id,
          payment: { status: "PAID" },
        },
      },
      select: { id: true },
    });

    if (!verifiedPurchase) {
      return NextResponse.json(
        { error: "Only verified purchasers can review this product." },
        { status: 403 },
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        title: title || null,
        body: reviewBody,
        isApproved: false,
      },
      select: {
        id: true,
        title: true,
        body: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        review,
        message: "Review submitted for moderation.",
      },
      { status: 201 },
    );
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "You have already reviewed this product." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Unable to submit review." },
      { status: 500 },
    );
  }
}
