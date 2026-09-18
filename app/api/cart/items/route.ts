import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cartAddSchema, cartUpdateSchema } from "@/lib/validation/api";

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
    const parsed = cartAddSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid cart item." },
        { status: 400 },
      );
    }

    const { productId, variantId, quantity } = parsed.data;

    const product = await prisma.product.findFirst({
      where: { id: productId, status: "ACTIVE" },
      include: {
        variants: {
          where: { isActive: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product unavailable." },
        { status: 404 },
      );
    }

    const variant = variantId
      ? product.variants.find((item) => item.id === variantId)
      : null;

    if (variantId && !variant) {
      return NextResponse.json(
        { error: "Variant unavailable." },
        { status: 404 },
      );
    }

    if (variant && variant.stock < quantity) {
      return NextResponse.json(
        { error: "Not enough stock available." },
        { status: 409 },
      );
    }

    // userId is indexed, not necessarily unique in every schema revision,
    // so use findFirst rather than findUnique.
    let cart = await prisma.cart.findFirst({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        ...(variantId ? { variantId } : { variantId: null }),
      },
    });

    if (existing) {
      const nextQuantity = existing.quantity + quantity;

      if (variant && variant.stock < nextQuantity) {
        return NextResponse.json(
          { error: "Not enough stock available." },
          { status: 409 },
        );
      }

      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: nextQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          ...(variantId ? { variantId } : {}),
          quantity,
          unitPrice: variant?.price ?? product.price,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to add item to cart." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = cartUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid quantity." },
        { status: 400 },
      );
    }

    const { itemId, quantity } = parsed.data;

    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId: user.id },
      },
      include: {
        variant: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Cart item not found." },
        { status: 404 },
      );
    }

    if (item.variant && item.variant.stock < quantity) {
      return NextResponse.json(
        { error: "Not enough stock available." },
        { status: 409 },
      );
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to update cart." },
      { status: 500 },
    );
  }
}
