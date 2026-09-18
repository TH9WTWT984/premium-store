import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export function hasPermission(admin: Awaited<ReturnType<typeof getCurrentAdmin>>, key: string) {
  return Boolean(admin?.role.permissions.some((permission) => permission.key === key));
}

export async function requireAdminPermission(key: string) {
  const admin = await requireAdmin();
  if (!hasPermission(admin, key)) redirect("/admin/dashboard");
  return admin;
}
