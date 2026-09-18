import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";

function formatPrice(value: unknown) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

type SearchParams = Promise<{ q?: string; status?: string; category?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireAdminPermission("products.read");
  const params = await searchParams;
  const q = (params.q || "").trim();
  const status = params.status || "";
  const category = params.category || "";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(q ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
        } : {}),
        ...(status ? { status: status as "DRAFT" | "ACTIVE" | "ARCHIVED" } : {}),
        ...(category ? { categoryId: category } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
        variants: { where: { isActive: true }, select: { stock: true } },
      },
    }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
  ]);

  return (
    <AdminShell adminName={admin.name} adminRole={admin.role.name} permissions={admin.role.permissions.map((permission) => permission.key)}>
      <div className="admin-content">
        <div className="admin-topbar">
          <div>
            <div className="eyebrow">Catalog</div>
            <h1 className="serif admin-title">Products</h1>
            <p className="admin-muted">Manage products, imagery, pricing, variants and stock.</p>
          </div>
          <Link className="btn btn-dark" href="/admin/products/new">New product</Link>
        </div>

        <form className="admin-filter-bar" method="get">
          <input className="field" name="q" placeholder="Search name or SKU…" defaultValue={q} />
          <select className="field" name="status" defaultValue={status}>
            <option value="">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
          <select className="field" name="category" defaultValue={category}>
            <option value="">All categories</option>
            {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button className="btn btn-light" type="submit">Filter</button>
          <Link className="admin-clear-filter" href="/admin/products">Clear</Link>
        </form>

        <div className="admin-panel admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Category</th><th>Status</th><th>Price</th><th>Stock</th><th></th></tr></thead>
            <tbody>
              {products.map((product) => {
                const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
                const stockClass = stock === 0 ? "stock-out" : stock < 5 ? "stock-low" : "";
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        <div className="admin-thumb">
                          {product.images[0] ? <img src={product.images[0].url} alt={product.images[0].alt || product.name} /> : <span>No image</span>}
                        </div>
                        <div><strong>{product.name}</strong><div className="admin-muted">{product.sku || "No SKU"}</div></div>
                      </div>
                    </td>
                    <td>{product.category.name}</td>
                    <td><span className={`status status-${product.status.toLowerCase()}`}>{product.status}</span></td>
                    <td>{formatPrice(product.price)}</td>
                    <td><span className={stockClass}>{stock}</span>{stock === 0 && <span className="stock-note"> Out</span>}{stock > 0 && stock < 5 && <span className="stock-note"> Low</span>}</td>
                    <td><Link href={`/admin/products/${product.id}/edit`} className="admin-row-link">Edit →</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {products.length === 0 && <div className="admin-empty"><div className="eyebrow">No matches</div><h2 className="serif">No products match these filters.</h2><Link className="btn btn-dark" href="/admin/products/new">Create product</Link></div>}
        </div>
      </div>
    </AdminShell>
  );
}
