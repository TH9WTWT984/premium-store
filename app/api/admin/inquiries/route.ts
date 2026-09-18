import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAdmin(permission: string) {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.role.permissions.some((item) => item.key === permission)) return null;
  return admin;
}

const allowedStatuses = ["NEW", "CONTACTED", "QUOTED", "CONVERTED", "CLOSED"] as const;

export async function GET(request: Request) {
  const admin = await getAdmin("products.read");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(request.url);
  const requestedStatus = url.searchParams.get("status") || "all";
  const search = url.searchParams.get("q")?.trim() || "";

  const where = {
    ...(requestedStatus !== "all" && allowedStatuses.includes(requestedStatus as (typeof allowedStatuses)[number])
      ? { status: requestedStatus as (typeof allowedStatuses)[number] }
      : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, counts] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true } },
            variant: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.inquiry.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  return NextResponse.json({
    items,
    counts: Object.fromEntries(counts.map((entry) => [entry.status, entry._count._all])),
    statuses: allowedStatuses,
  });
}
