import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";
import ProductForm from "../../product-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminPermission("products.write");
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { createdAt: "asc" } } } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();
  return <AdminShell adminName={admin.name} adminRole={admin.role.name} permissions={admin.role.permissions.map((permission) => permission.key)}><div className="admin-content"><div className="admin-topbar"><div><div className="eyebrow">Catalog / Edit</div><h1 className="serif admin-title">{product.name}</h1><p className="admin-muted">Update this product and keep the storefront in sync.</p></div></div><ProductForm categories={categories.map((category) => ({ id: category.id, name: category.name }))} initial={{ id: product.id, name: product.name, slug: product.slug, categoryId: product.categoryId, description: product.description, shortDescription: product.shortDescription || "", sku: product.sku || "", price: product.price.toString(), compareAtPrice: product.compareAtPrice?.toString() || "", status: product.status, featured: product.featured, seoTitle: product.seoTitle || "", seoDescription: product.seoDescription || "", images: product.images.map((image) => ({ id: image.id, url: image.url, alt: image.alt || "", sortOrder: image.sortOrder, isPrimary: image.isPrimary })), variants: product.variants.map((variant) => ({ id: variant.id, name: variant.name, sku: variant.sku, price: variant.price?.toString() || "", stock: String(variant.stock), isActive: variant.isActive })) }} /></div></AdminShell>;
}
