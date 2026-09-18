import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductPageClient from "@/app/components/product-page-client";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
    include: {
      category: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
      },
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = product.seoTitle?.trim() || product.name;

  const description =
    product.seoDescription?.trim() ||
    product.shortDescription?.trim() ||
    product.description.slice(0, 160);

  const primaryImage =
    product.images.find((image) => image.isPrimary)?.url ||
    product.images[0]?.url;

  const canonical = `/product/${product.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "ATELIER",
      locale: "en_IN",
      ...(primaryImage
        ? {
            images: [
              {
                url: primaryImage,
                alt:
                  product.images.find((image) => image.isPrimary)?.alt ||
                  product.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: primaryImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(primaryImage ? { images: [primaryImage] } : {}),
    },
  };
}

function productStructuredData(
  product: Awaited<ReturnType<typeof getProduct>>,
) {
  if (!product) return null;

  const imageUrls = product.images
    .map((image) => image.url)
    .filter(Boolean);

  const offers =
    product.variants.length > 0
      ? product.variants.map((variant) => ({
          "@type": "Offer",
          url: `${siteUrl}/product/${product.slug}`,
          priceCurrency: "INR",
          price: Number(variant.price ?? product.price).toFixed(2),
          availability:
            variant.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          sku: variant.sku,
        }))
      : [
          {
            "@type": "Offer",
            url: `${siteUrl}/product/${product.slug}`,
            priceCurrency: "INR",
            price: Number(product.price).toFixed(2),
            availability: "https://schema.org/InStock",
            sku: product.sku || undefined,
          },
        ];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.shortDescription?.trim() ||
      product.description.slice(0, 500),
    sku: product.sku || undefined,
    brand: {
      "@type": "Brand",
      name: "ATELIER",
    },
    category: product.category.name,
    image: imageUrls,
    offers,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const jsonLd = productStructuredData(product);

  // Prisma Decimal values must be converted before
  // passing the product to the client component.
  const clientProduct = {
    ...product,
    price: Number(product.price),
    compareAtPrice:
      product.compareAtPrice == null
        ? null
        : Number(product.compareAtPrice),
    variants: product.variants.map((variant) => ({
      ...variant,
      price:
        variant.price == null
          ? null
          : Number(variant.price),
    })),
  };

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      ) : null}

      <ProductPageClient product={clientProduct} />
    </>
  );
}