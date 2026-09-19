import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { wishlistSchema } from "@/lib/validation/api";

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
    const parsed = wishlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Product is required." },
        { status: 400 },
      );
    }

    const { productId } = parsed.data;

    const product = await prisma.product.findFirst({
      where: { id: productId, status: "ACTIVE" },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product unavailable." },
        { status: 404 },
      );
    }

    const wishlist = await prisma.wishlist.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    const existing = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({
        where: { id: existing.id },
      });
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      saved: !existing,
      wishlisted: !existing,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to update wishlist." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const productId = new URL(request.url).searchParams.get("productId")?.trim();
  if (!productId) return NextResponse.json({ error: "Product is required." }, { status: 400 });

  const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
  if (wishlist) {
    await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
  }
  return NextResponse.json({ ok: true, saved: false, wishlisted: false });
}
