import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const inquirySchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional(),
  quantity: z.coerce.number().int().min(1).max(100000),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().max(3000).optional().or(z.literal("")),
  itemNotes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const payload = inquirySchema.parse(await request.json());

    const product = await prisma.product.findFirst({
      where: { id: payload.productId, status: "ACTIVE" },
      include: {
        variants: {
          where: { isActive: true },
          select: { id: true, name: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product is no longer available." }, { status: 404 });
    }

    if (payload.variantId) {
      const variant = product.variants.find((item) => item.id === payload.variantId);
      if (!variant) {
        return NextResponse.json({ error: "Selected option is unavailable." }, { status: 400 });
      }
    } else if (product.variants.length > 0) {
      return NextResponse.json({ error: "Please select an option before requesting a quote." }, { status: 400 });
    }

    const user = await getCurrentUser();

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: user?.id ?? null,
        name: payload.name,
        email: payload.email.toLowerCase(),
        phone: payload.phone || null,
        company: payload.company || null,
        message: payload.message || null,
        items: {
          create: {
            productId: product.id,
            variantId: payload.variantId || null,
            quantity: payload.quantity,
            notes: payload.itemNotes || null,
          },
        },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        inquiryId: inquiry.id,
        status: inquiry.status,
        message: "Your quote request has been received.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please check the information in the form and try again." },
        { status: 400 },
      );
    }

    console.error("POST /api/inquiries", error);
    return NextResponse.json(
      { error: "Unable to submit your quote request right now." },
      { status: 500 },
    );
  }
}
