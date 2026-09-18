import Link from "next/link";
import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";
import MediaLibrary from "./media-library";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const admin = await requireAdminPermission("products.read");

  return (
    <AdminShell
      adminName={admin.name}
      adminRole={admin.role.name}
      permissions={admin.role.permissions.map((permission) => permission.key)}
    >
      <div className="admin-content media-page">
        <div className="media-breadcrumb">
          <Link href="/admin/dashboard">Overview</Link>
          <span>→</span>
          <strong>Media</strong>
        </div>

        <div className="admin-topbar media-topbar">
          <div>
            <div className="eyebrow">Content operations</div>
            <h1 className="serif admin-title">Media Library</h1>
            <p className="admin-muted">
              One place for the images that power products, categories and the
              storefront.
            </p>
          </div>
        </div>

        <MediaLibrary />
      </div>
    </AdminShell>
  );
}
