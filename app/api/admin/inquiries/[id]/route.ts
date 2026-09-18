import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUOTED", "CONVERTED", "CLOSED"]),
  adminNotes: z.string().max(5000).nullable(),
});

async function getAdmin(permission: string) {
  const admin = await getCurrentAdmin();
  if (!admin || !admin.role.permissions.some((item) => item.key === permission)) return null;
  return admin;
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdmin("products.read");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, sku: true } },
          variant: { select: { id: true, name: true, sku: true } },
        },
      },
    },
  });

  if (!inquiry) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });

  return NextResponse.json(inquiry);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdmin("products.write");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const payload = updateSchema.parse(await request.json());

    const current = await prisma.inquiry.findUnique({
      where: { id },
      select: { status: true, adminNotes: true },
    });

    if (!current) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        status: payload.status,
        adminNotes: payload.adminNotes?.trim() || null,
      },
      select: { id: true, status: true, adminNotes: true },
    });

    if (current.status !== updated.status || current.adminNotes !== updated.adminNotes) {
      await prisma.activityLog.create({
        data: {
          adminUserId: admin.id,
          action: "UPDATE",
          entity: "Inquiry",
          entityId: updated.id,
          metadata: {
            previousStatus: current.status,
            nextStatus: updated.status,
            notesUpdated: current.adminNotes !== updated.adminNotes,
          },
        },
      });
    }

    return NextResponse.json({ ok: true, inquiry: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid inquiry update." }, { status: 400 });
    }

    console.error("PATCH /api/admin/inquiries/[id]", error);
    return NextResponse.json({ error: "Unable to update inquiry." }, { status: 500 });
  }
}
