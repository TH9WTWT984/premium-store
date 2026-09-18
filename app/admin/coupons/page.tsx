import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";
import CouponManager from "./coupon-manager";

export default async function CouponsPage() {
  const admin = await requireAdminPermission("products.read");

  return (
    <AdminShell
      adminName={admin.name}
      adminRole={admin.role.name}
      permissions={admin.role.permissions.map((permission) => permission.key)}
    >
      <CouponManager />
    </AdminShell>
  );
}
