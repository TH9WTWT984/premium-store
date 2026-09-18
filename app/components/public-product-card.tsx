import Link from "next/link";
import ProductImage from "./product-image";

type ProductCardProduct = {
  id: string;
  slug: string;
  name: string;
  price: unknown;
  shortDescription: string | null;
  category: { name: string };
  featured: boolean;
  images: { url: string; alt: string | null }[];
};

export default function PublicProductCard({ product }: { product: ProductCardProduct }) {
  const image = product.images[0];

  return (
    <article className="card public-product-card">
      <Link href={`/product/${product.slug}`}>
        <div className="card-image public-card-image">
          {product.featured && <span className="badge">Featured</span>}
          <ProductImage
            src={image?.url}
            alt={image?.alt || product.name}
          />
        </div>
        <div className="card-info">
          <div>
            <div className="card-name">{product.name}</div>
            <div className="card-sub">{product.category.name}</div>
          </div>
          <div className="card-price">
            ₹{Number(product.price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </div>
        </div>
      </Link>
    </article>
  );
}
