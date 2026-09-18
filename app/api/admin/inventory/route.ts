import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin";
import { InventoryMovementType } from "@prisma/client";

export async function GET() {
  try {
    const admin = await requireAdminPermission("products.read");

    const [variants, transactions] = await Promise.all([
      prisma.productVariant.findMany({
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              status: true,
            },
          },
        },
        orderBy: [{ stock: "asc" }, { createdAt: "desc" }],
      }),
      prisma.inventoryTransaction.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        include: {
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
              product: { select: { name: true } },
            },
          },
          adminUser: {
            select: { name: true, email: true },
          },
          order: {
            select: { orderNumber: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      admin: { id: admin.id },
      variants,
      transactions,
    });
  } catch (error) {
    console.error("GET /api/admin/inventory", error);
    return NextResponse.json(
      { error: "Unable to load inventory." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminPermission("products.write");
    const body = await request.json();

    const variantId = String(body.variantId || "");
    const type = String(body.type || "");
    const quantity = Number(body.quantity);
    const reason =
      body.reason !== undefined && body.reason !== null
        ? String(body.reason).trim()
        : "";

    if (!variantId) {
      return NextResponse.json(
        { error: "Variant is required." },
        { status: 400 }
      );
    }

    const allowedTypes = new Set<InventoryMovementType>([
      InventoryMovementType.RESTOCK,
      InventoryMovementType.ADJUSTMENT,
      InventoryMovementType.RETURN,
    ]);

    if (!allowedTypes.has(type as InventoryMovementType)) {
      return NextResponse.json(
        { error: "Invalid inventory movement type." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be a positive whole number." },
        { status: 400 }
      );
    }

    if (reason.length > 300) {
      return NextResponse.json(
        { error: "Reason must be 300 characters or fewer." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        select: {
          id: true,
          stock: true,
          product: { select: { name: true } },
        },
      });

      if (!variant) throw new Error("VARIANT_NOT_FOUND");

      const stockBefore = variant.stock;
      const stockAfter = stockBefore + quantity;

      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stock: stockAfter },
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          variantId: variant.id,
          adminUserId: admin.id,
          type: type as InventoryMovementType,
          quantity,
          stockBefore,
          stockAfter,
          reason: reason || null,
        },
      });

      await tx.activityLog.create({
        data: {
          adminUserId: admin.id,
          action: "INVENTORY_ADJUSTED",
          entity: "ProductVariant",
          entityId: variant.id,
          metadata: {
            productName: variant.product.name,
            movementType: type,
            quantity,
            stockBefore,
            stockAfter,
            reason: reason || null,
            inventoryTransactionId: transaction.id,
          },
        },
      });

      return { variantId: variant.id, stockBefore, stockAfter };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("POST /api/admin/inventory", error);

    const message = error instanceof Error ? error.message : "";

    if (message === "VARIANT_NOT_FOUND") {
      return NextResponse.json(
        { error: "Variant not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Unable to update inventory." },
      { status: 500 }
    );
  }
}
