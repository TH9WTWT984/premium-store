import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";
import ProductForm from "../product-form";

export default async function NewProductPage() {
  const admin = await requireAdminPermission("products.write");
  const categories = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  return <AdminShell adminName={admin.name} adminRole={admin.role.name} permissions={admin.role.permissions.map((permission) => permission.key)}><div className="admin-content"><div className="admin-topbar"><div><div className="eyebrow">Catalog / New</div><h1 className="serif admin-title">Add product</h1><p className="admin-muted">Create a catalog item with imagery, pricing and inventory.</p></div></div><ProductForm categories={categories.map((category) => ({ id: category.id, name: category.name }))} initial={{ name: "", slug: "", categoryId: categories[0]?.id || "", description: "", shortDescription: "", sku: "", price: "", compareAtPrice: "", status: "DRAFT", featured: false, seoTitle: "", seoDescription: "", images: [{ url: "", alt: "", sortOrder: 0, isPrimary: true }], variants: [] }} /></div></AdminShell>;
}
