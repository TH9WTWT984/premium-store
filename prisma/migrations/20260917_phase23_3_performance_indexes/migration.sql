CREATE INDEX IF NOT EXISTS "Product_status_featured_createdAt_idx"
  ON "Product" ("status", "featured", "createdAt");

CREATE INDEX IF NOT EXISTS "Product_categoryId_status_createdAt_idx"
  ON "Product" ("categoryId", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "ProductVariant_productId_isActive_stock_idx"
  ON "ProductVariant" ("productId", "isActive", "stock");

CREATE INDEX IF NOT EXISTS "Category_isActive_sortOrder_name_idx"
  ON "Category" ("isActive", "sortOrder", "name");

CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx"
  ON "Order" ("status", "createdAt");
