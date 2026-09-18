import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ admin: null });
  return NextResponse.json({ admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role.name, permissions: admin.role.permissions.map((p) => p.key) } });
}
