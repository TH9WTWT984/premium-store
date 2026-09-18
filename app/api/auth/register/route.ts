import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validation/api";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Enter valid account details." },
        { status: 400 },
      );
    }

    const { firstName, lastName, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName: lastName || null,
        email,
        passwordHash,
      },
    });

    await createUserSession(user.id);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.code === "P2002"
            ? "An account with that email already exists."
            : "Unable to create your account.",
      },
      { status: 400 },
    );
  }
}
