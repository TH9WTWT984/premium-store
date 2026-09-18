import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";
import CategoryMediaManager from "./category-media-manager";

export const dynamic = "force-dynamic";

export default async function CategoryMediaPage() {
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
            <div className="eyebrow">Catalog presentation</div>
            <h1 className="serif admin-title">Category imagery</h1>
            <p className="admin-muted">
              Choose a hero image for every storefront category from your Media Library.
            </p>
          </div>
        </div>
        <CategoryMediaManager />
      </div>
    </AdminShell>
  );
}
