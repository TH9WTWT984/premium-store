import { prisma } from "@/lib/prisma";

export async function getCartByUserId(userId: string) {
  return prisma.cart.findFirst({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
              images: {
                orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
                take: 1,
              },
            },
          },
          variant: true,
        },
      },
    },
  });
}

export async function getCartSummary(userId: string) {
  const cart = await getCartByUserId(userId);

  if (!cart) {
    return {
      cart: null,
      subtotal: 0,
      itemCount: 0,
    };
  }

  let subtotal = 0;
  let itemCount = 0;

  for (const item of cart.items) {
    subtotal += Number(item.unitPrice) * item.quantity;
    itemCount += item.quantity;
  }

  return { cart, subtotal, itemCount };
}
