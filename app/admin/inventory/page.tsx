import { prisma } from "@/lib/prisma";
import { requireAdminPermission } from "@/lib/admin";
import AdminShell from "@/app/admin/components/admin-shell";
import InventoryActions from "./inventory-actions";

function stockClass(stock: number) {
  if (stock === 0) return "stock-out";
  if (stock < 5) return "stock-low";
  return "";
}

function movementLabel(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function InventoryPage() {
  const admin = await requireAdminPermission("products.read");

  const [variants, transactions] = await Promise.all([
    prisma.productVariant.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            status: true,
          },
        },
      },
      orderBy: [{ stock: "asc" }, { createdAt: "desc" }],
    }),
    prisma.inventoryTransaction.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        variant: {
          select: {
            name: true,
            sku: true,
            product: { select: { name: true } },
          },
        },
        adminUser: { select: { name: true } },
        order: { select: { orderNumber: true } },
      },
    }),
  ]);

  const totalVariants = variants.length;
  const outOfStock = variants.filter((variant) => variant.stock === 0).length;
  const lowStock = variants.filter(
    (variant) => variant.stock > 0 && variant.stock < 5
  ).length;
  const totalUnits = variants.reduce((sum, variant) => sum + variant.stock, 0);

  return (
    <AdminShell
      adminName={admin.name}
      adminRole={admin.role.name}
      permissions={admin.role.permissions.map((permission) => permission.key)}
    >
      <div className="admin-content">
        <div className="admin-topbar">
          <div>
            <div className="eyebrow">Operations</div>
            <h1 className="serif admin-title">Inventory</h1>
            <p className="admin-muted">
              Monitor variant stock and record every manual inventory movement.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div className="admin-panel" style={{ padding: 18 }}>
            <div className="eyebrow">Variants</div>
            <div className="serif" style={{ fontSize: 32, marginTop: 6 }}>
              {totalVariants}
            </div>
          </div>

          <div className="admin-panel" style={{ padding: 18 }}>
            <div className="eyebrow">Units in stock</div>
            <div className="serif" style={{ fontSize: 32, marginTop: 6 }}>
              {totalUnits}
            </div>
          </div>

          <div className="admin-panel" style={{ padding: 18 }}>
            <div className="eyebrow">Low stock</div>
            <div
              className="serif stock-low"
              style={{ fontSize: 32, marginTop: 6 }}
            >
              {lowStock}
            </div>
          </div>

          <div className="admin-panel" style={{ padding: 18 }}>
            <div className="eyebrow">Out of stock</div>
            <div
              className="serif stock-out"
              style={{ fontSize: 32, marginTop: 6 }}
            >
              {outOfStock}
            </div>
          </div>
        </div>

        <InventoryActions
          variants={variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            sku: variant.sku,
            stock: variant.stock,
            isActive: variant.isActive,
            product: variant.product,
          }))}
        />

        <div className="admin-panel admin-table-wrap">
          <div style={{ padding: "18px 18px 0" }}>
            <div className="eyebrow">Current stock</div>
            <h2 className="serif" style={{ marginTop: 6 }}>
              Variant inventory
            </h2>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>SKU</th>
                <th>Status</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant) => (
                <tr key={variant.id}>
                  <td>
                    <strong>{variant.product.name}</strong>
                    <div className="admin-muted">
                      {variant.product.sku || "No product SKU"}
                    </div>
                  </td>
                  <td>{variant.name}</td>
                  <td>{variant.sku}</td>
                  <td>
                    <span
                      className={`status status-${variant.product.status.toLowerCase()}`}
                    >
                      {variant.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td>
                    <span className={stockClass(variant.stock)}>
                      {variant.stock}
                    </span>
                    {variant.stock === 0 && (
                      <span className="stock-note"> Out</span>
                    )}
                    {variant.stock > 0 && variant.stock < 5 && (
                      <span className="stock-note"> Low</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {variants.length === 0 && (
            <div className="admin-empty">
              <div className="eyebrow">No variants</div>
              <h2 className="serif">No product variants exist yet.</h2>
            </div>
          )}
        </div>

        <div
          className="admin-panel admin-table-wrap"
          style={{ marginTop: 24 }}
        >
          <div style={{ padding: "18px 18px 0" }}>
            <div className="eyebrow">Inventory history</div>
            <h2 className="serif" style={{ marginTop: 6 }}>
              Recent movements
            </h2>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Movement</th>
                <th>Change</th>
                <th>Stock</th>
                <th>Source</th>
                <th>Admin</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <tr key={item.id}>
                  <td>{item.createdAt.toLocaleString("en-IN")}</td>
                  <td>
                    <strong>{item.variant.product.name}</strong>
                    <div className="admin-muted">{item.variant.name}</div>
                  </td>
                  <td>{movementLabel(item.type)}</td>
                  <td>
                    <strong>+{item.quantity}</strong>
                  </td>
                  <td>
                    {item.stockBefore} → {item.stockAfter}
                  </td>
                  <td>{item.order?.orderNumber || item.reason || "Manual"}</td>
                  <td>{item.adminUser?.name || "System"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="admin-empty">
              <div className="eyebrow">No history</div>
              <h2 className="serif">No inventory movements recorded yet.</h2>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
