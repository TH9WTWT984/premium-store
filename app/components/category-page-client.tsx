"use client";

import Link from "next/link";
import ProductImage from "@/app/components/product-image";

export default function CategoryPageClient({ category }: { category: any }) {
  return (
    <main style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 32px 90px" }}>
      <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "#8e8479" }}>Collection</div>
      <h1 className="serif" style={{ fontSize: 68, lineHeight: .9, margin: "12px 0 18px" }}>{category.name}</h1>
      {category.description && (
        <p style={{ maxWidth: 650, color: "#6f665e", lineHeight: 1.7 }}>{category.description}</p>
      )}

      <div style={{ marginTop: 42, display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 18 }}>
        {category.products.map((product: any) => {
          const image = product.images?.[0];
          const inStock = product.variants?.some((variant: any) => variant.stock > 0);
          return (
            <Link key={product.id} href={`/product/${product.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
              <div style={{ aspectRatio: "4 / 5", background: "#ebe5dd", overflow: "hidden" }}>
                {image?.url ? (
                  <ProductImage src={image.url} alt={image.alt || product.name} />
                ) : (
                  <div style={{ height: "100%", display: "grid", placeItems: "center", fontFamily: "Georgia,serif", letterSpacing: ".15em", color: "#958a7f" }}>ATELIER</div>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingTop: 10 }}>
                <div>
                  <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: ".11em", color: "#91877d" }}>{category.name}</div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: 18, marginTop: 4 }}>{product.name}</div>
                </div>
                <div style={{ fontSize: 12 }}>₹{Number(product.price).toLocaleString("en-IN")}</div>
              </div>
              <div style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: ".1em", marginTop: 5, color: inStock ? "#4d7752" : "#9d6258" }}>
                {inStock ? "In stock" : "Out of stock"}
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
