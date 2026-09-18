import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertValidEmail, createAdminSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    if (!assertValidEmail(email) || !password) return NextResponse.json({ error: "Enter your admin email and password." }, { status: 400 });

    const admin = await prisma.adminUser.findUnique({ where: { email }, include: { role: true } });
    if (!admin || !admin.isActive || !(await verifyPassword(password, admin.passwordHash))) {
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    await createAdminSession(admin.id);
    return NextResponse.json({ admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role.name } });
  } catch {
    return NextResponse.json({ error: "Unable to sign in right now." }, { status: 500 });
  }
}
