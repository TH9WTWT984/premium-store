import { NextRequest, NextResponse } from "next/server";
import { getActiveProducts } from "@/lib/catalog";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const products = await getActiveProducts({
    query: params.get("q") || undefined,
    categorySlug: params.get("category") || undefined,
    featuredOnly: params.get("featured") === "true",
  });

  return NextResponse.json(products);
}
