import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "http://localhost:3000";

function absoluteUrl(value?: string | null) {
  if (!value) return `${siteUrl}/og-default.jpg`;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  return `${siteUrl}${value.startsWith("/") ? "" : "/"}${value}`;
}

function cleanDescription(
  value: string | null | undefined,
  fallback: string,
) {
  const text = (value || fallback)
    .replace(/\s+/g, " ")
    .trim();

  return text.length > 160
    ? `${text.slice(0, 157).trimEnd()}...`
    : text;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
    include: {
      category: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },
    },
  });

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

  const description = cleanDescription(
    product.seoDescription,
    product.shortDescription || product.description,
  );

  const canonical = `/product/${product.slug}`;

  const image = absoluteUrl(product.images[0]?.url);

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

      images: [
        {
          url: image,
          alt:
            product.images[0]?.alt ||
            product.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProductSeoLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },

    include: {
      category: true,

      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        take: 1,
      },

      variants: {
        where: {
          isActive: true,
        },

        select: {
          price: true,
          stock: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const image = absoluteUrl(product.images[0]?.url);

  const prices = product.variants.map((variant) =>
    Number(variant.price ?? product.price),
  );

  const lowPrice = prices.length
    ? Math.min(...prices)
    : Number(product.price);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",

    name: product.name,

    description: cleanDescription(
      product.seoDescription,
      product.shortDescription || product.description,
    ),

    sku: product.sku || undefined,

    category: product.category.name,

    image: [image],

    url: `${siteUrl}/product/${product.slug}`,

    brand: {
      "@type": "Brand",
      name: "ATELIER",
    },

    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${product.slug}`,

      /*
       * Product currency is INR.
       * Product model does not contain a currency field.
       */
      priceCurrency: "INR",

      price: lowPrice.toFixed(2),

      availability: product.variants.some(
        (variant) => variant.stock > 0,
      )
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },

      {
        "@type": "ListItem",
        position: 2,
        name: product.category.name,
        item: `${siteUrl}/category/${product.category.slug}`,
      },

      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${siteUrl}/product/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />

      {children}
    </>
  );
}
