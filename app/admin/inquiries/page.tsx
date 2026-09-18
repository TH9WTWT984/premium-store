import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";
import InquiryManager from "./inquiry-manager";

export default async function InquiriesPage() {
  const admin = await requireAdminPermission("products.read");

  return (
    <AdminShell
      adminName={admin.name}
      adminRole={admin.role.name}
      permissions={admin.role.permissions.map((permission) => permission.key)}
    >
      <div className="admin-content">
        <div className="admin-topbar">
          <div>
            <div className="eyebrow">Sales pipeline</div>
            <h1 className="serif admin-title">Inquiries</h1>
            <p className="admin-muted">
              Manage wholesale and custom quote requests separately from retail orders.
            </p>
          </div>
        </div>
        <InquiryManager />
      </div>
    </AdminShell>
  );
}
