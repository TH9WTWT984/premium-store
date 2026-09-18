import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";
import CategoryManager from "./category-manager";

export default async function CategoriesPage() { const admin = await requireAdminPermission("products.write"); const categories = await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], include: { _count: { select: { products: true } } } }); return <AdminShell adminName={admin.name} adminRole={admin.role.name} permissions={admin.role.permissions.map((permission) => permission.key)}><div className="admin-content"><div className="admin-topbar"><div><div className="eyebrow">Catalog</div><h1 className="serif admin-title">Categories</h1><p className="admin-muted">Organize the storefront into clear collections.</p></div></div><CategoryManager initial={categories} /></div></AdminShell>; }
