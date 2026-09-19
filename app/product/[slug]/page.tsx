import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StoreHeader from "@/app/components/store-header";
import StoreFooter from "@/app/components/store-footer";
import MobileNav from "@/app/components/mobile-nav";
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

  const title = product.seoTitle?.trim() || `${product.name} — ATELIER`;

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

  // 1. Fetch Sibling Variant Looks (products in same category or matching series)
  const prefix = product.slug.split("-")[0];
  const siblingProducts = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      OR: [
        { categoryId: product.categoryId },
        { slug: { startsWith: prefix } },
      ],
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 6,
    include: {
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
    },
  });

  const variantLooks = siblingProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    image: p.images[0]?.url || "",
    active: p.id === product.id,
  }));

  // 2. Fetch Related Products ("Others Also Bought")
  let relatedProducts = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      id: { not: product.id },
      categoryId: product.categoryId,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 4,
    include: {
      category: { select: { name: true } },
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 2,
      },
    },
  });

  // If fewer than 4 in same category, supplement with other active products
  if (relatedProducts.length < 4) {
    const existingIds = [product.id, ...relatedProducts.map((p) => p.id)];
    const additional = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        id: { notIn: existingIds },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 4 - relatedProducts.length,
      include: {
        category: { select: { name: true } },
        images: {
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
          take: 2,
        },
      },
    });
    relatedProducts = [...relatedProducts, ...additional];
  }

  const jsonLd = productStructuredData(product);

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

      <StoreHeader />

      <ProductPageClient
        key={product.id} // Ensures clean state reset when navigating between products
        product={clientProduct}
        variantLooks={variantLooks}
        relatedProducts={relatedProducts.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          price: Number(item.price),
          compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
          category: item.category.name,
          primaryImage: item.images[0]?.url || null,
          secondaryImage: item.images[1]?.url || item.images[0]?.url || null,
          alt: item.images[0]?.alt || item.name,
        }))}
      />

      <StoreFooter />
      <MobileNav />
    </>
  );
}