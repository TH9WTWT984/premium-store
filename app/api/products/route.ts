import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { category: true, images: { orderBy: { sortOrder: "asc" } }, variants: { where: { isActive: true } } },
  });
  return NextResponse.json(products);
}
