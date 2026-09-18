import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoreHeader from "@/app/components/store-header";
import StyleProductDetail from "@/app/components/style-product-detail";
import { getPublicCategoryPage as getCategory, getPublicProductPage as getProduct } from "@/lib/storefront-cache";

const STYLE_IMAGES: Record<string, string> = {
  plain: "/images/tshirts/01-plain.jpg",
  printed: "/images/tshirts/02-printed.jpg",
  embroidered: "/images/tshirts/03-embroidered.jpg",
  "off-shoulder": "/images/tshirts/04-off-shoulder.jpg",
  compression: "/images/tshirts/05-compression.jpg",
  knitted: "/images/tshirts/06-knitted.jpg",
  polo: "/images/tshirts/07-polo.jpg",
  "boxy-fit-full-sleeves": "/images/tshirts/08-boxy-fit-full-sleeves.jpg",
};

const STYLE_LABELS: Record<string, string> = {
  plain: "Plain",
  printed: "Printed",
  embroidered: "Embroidered",
  "off-shoulder": "Off-shoulder",
  compression: "Compression",
  knitted: "Knitted",
  polo: "Polo",
  "boxy-fit-full-sleeves": "Boxy-fit Full Sleeves",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Collection not found", robots: { index: false, follow: false } };

  return {
    title: `${category.name} — ATELIER`,
    description: category.description?.trim() || `Explore the ${category.name} collection at ATELIER.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryStylePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ style?: string; design?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await getCategory(slug);
  if (!category) notFound();

  const requestedStyle = (query.style || query.design || "").trim().toLowerCase();
  const styleLabel =
    STYLE_LABELS[requestedStyle] ||
    (requestedStyle ? requestedStyle.replace(/[-_]+/g, " ") : "Collection");

  // A style card is a visual entry point. When the catalog already has a
  // matching active product, use it. Otherwise use the first active product
  // so the style URL still opens the normal product-detail experience.
  const normalizedStyle = requestedStyle.replace(/[-_]+/g, " ");
  const matchingProduct = requestedStyle
    ? category.products.find((product) => {
        const haystack = `${product.name} ${product.shortDescription || ""} ${product.description}`.toLowerCase();
        return haystack.includes(normalizedStyle) || haystack.includes(requestedStyle);
      })
    : null;

  const product = matchingProduct || category.products[0] || null;
  const fullProduct = product ? await getProduct(product.slug) : null;
  const previewImage = STYLE_IMAGES[requestedStyle] || STYLE_IMAGES.plain;

  const productForDetail = fullProduct
    ? {
        id: fullProduct.id,
        name: fullProduct.name,
        description: fullProduct.description,
        shortDescription: fullProduct.shortDescription,
        price: Number(fullProduct.price),
        compareAtPrice: fullProduct.compareAtPrice == null ? null : Number(fullProduct.compareAtPrice),
        images: fullProduct.images.map((image) => ({
          src: image.url,
          alt: image.alt || fullProduct.name,
        })),
        variants: fullProduct.variants.map((variant) => ({
          id: variant.id,
          name: variant.name,
          price: variant.price == null ? null : Number(variant.price),
          stock: variant.stock,
        })),
      }
    : null;

  return (
    <>
      <StoreHeader />
      <StyleProductDetail
        categoryName={category.name}
        categorySlug={category.slug}
        style={styleLabel}
        product={productForDetail}
        previewImages={[{ src: previewImage, alt: `${styleLabel} ${category.name}` }]}
      />
    </>
  );
}
